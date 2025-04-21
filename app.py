from flask import Flask, request, jsonify
from flask_cors import CORS 
import pickle
import numpy as np
import pandas as pd
import json
from flask import Flask, render_template
from scipy.sparse import hstack

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load the saved model and vectorizers
with open(r'modell\disease_prediction_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open(r'modell\tfidf_vectorizer.pkl', 'rb') as f:
    tfidf = pickle.load(f)
with open(r'modell\disease_encoder.pkl', 'rb') as f:
    le_disease = pickle.load(f)
with open(r'modell\gender_encoder.pkl', 'rb') as f:
    le_gender = pickle.load(f)
with open(r'modell\disease_mapping.json', 'r') as f:
    disease_mapping = json.load(f)

# Load precaution data
precaution_df = pd.read_csv(r'datasets\precaution_updated_with_lifestyle.csv')
precaution_df.columns = precaution_df.columns.str.strip()
precaution_df['Disease'] = precaution_df['Disease'].str.strip().str.lower()
precaution_df['All_Precautions'] = precaution_df['All_Precautions'].fillna('')

# Load description data
desc_df = pd.read_csv(r"datasets\Modified_Symptom_Description_with_PatientInfo.csv")
desc_df['Disease'] = desc_df['Disease'].str.lower().str.strip()
description_map = dict(zip(desc_df['Disease'], desc_df['Description']))

def get_precautions(disease_name):
    disease_name = disease_name.strip().lower()
    row = precaution_df[precaution_df['Disease'] == disease_name]
    if row.empty:
        return ["No precautions found."]

    precaution_text = row.iloc[0]['All_Precautions']
    precautions = [p.strip() for p in precaution_text.split(',') if p.strip()]
    return precautions

@app.route('/predict', methods=['POST'])
def predict():
    # Get data from request
    data = request.json
    
    # Extract features
    name = data.get('name', '')
    symptoms = data.get('symptoms', '')
    age = int(data.get('age', 30))
    gender_text = data.get('gender', 'male').lower()
    gender = 1 if gender_text == 'female' else 0
    stage = int(data.get('stage', 1))
    smoker = int(data.get('smoker', False))
    diabetes = int(data.get('diabetes', False))
    hypertension = int(data.get('hypertension', False))
    heart_disease = int(data.get('heart_disease', False))
    
    # Process symptom text
    symptom_vector = tfidf.transform([symptoms])
    
    # Combine with numerical features
    num_features = np.array([[age, gender, stage, smoker, diabetes, hypertension, heart_disease]])
    X_pred = hstack([symptom_vector, num_features])
    
    # Get probability distribution
    probs = model.predict_proba(X_pred)[0]
    
    # Get top 3 predictions with confidence
    top_indices = probs.argsort()[-3:][::-1]
    predictions = []
    
    for idx in top_indices:
        disease = le_disease.inverse_transform([idx])[0]
        confidence = probs[idx] * 100
        description = description_map.get(disease.lower(), "No description available.")
        precautions = get_precautions(disease)
        
        # Custom recommendations based on medical conditions
        custom_recs = []
        if smoker == 1:
            custom_recs.append("Consider a smoking cessation program to improve overall health")
        if diabetes == 1:
            custom_recs.append("Monitor blood sugar levels regularly")
        if hypertension == 1:
            custom_recs.append("Follow a low-sodium diet and take prescribed blood pressure medications")
        if heart_disease == 1:
            custom_recs.append("Regular cardiac check-ups and follow heart-healthy diet")
        
        predictions.append({
            'disease': disease,
            'confidence': float(confidence),
            'description': description,
            'precautions': precautions,
            'custom_recommendations': custom_recs
        })
    
    return jsonify({
        'predictions': predictions,
        'input': {
            'name': name,
            'symptoms': symptoms,
            'age': age,
            'gender': 'Female' if gender == 1 else 'Male',
            'stage': stage,
            'smoker': bool(smoker),
            'diabetes': bool(diabetes),
            'hypertension': bool(hypertension),
            'heart_disease': bool(heart_disease)
        }
    })

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/form')
def form():
    return render_template('form.html')

@app.route('/result')
def result():
    return render_template('result.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

if __name__ == '__main__':
    app.run(debug=True)

# from flask import Flask, request, jsonify, render_template, redirect, url_for
# from flask_cors import CORS 
# import pickle
# import numpy as np
# import pandas as pd
# import json
# from scipy.sparse import hstack
# import tensorflow as tf
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image
# import os
# from werkzeug.utils import secure_filename

# app = Flask(__name__)
# CORS(app)  # Enable CORS for frontend integration

# # Configure upload folder
# UPLOAD_FOLDER = 'uploads'
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# # Create uploads directory if it doesn't exist
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # Load the saved text-based model and vectorizers
# with open(r'modell\disease_prediction_model.pkl', 'rb') as f:
#     model = pickle.load(f)
# with open(r'modell\tfidf_vectorizer.pkl', 'rb') as f:
#     tfidf = pickle.load(f)
# with open(r'modell\disease_encoder.pkl', 'rb') as f:
#     le_disease = pickle.load(f)
# with open(r'modell\gender_encoder.pkl', 'rb') as f:
#     le_gender = pickle.load(f)
# with open(r'modell\disease_mapping.json', 'r') as f:
#     disease_mapping = json.load(f)

# # Load chest X-ray image model
# chest_xray_model = load_model('chest_xray_image.h5')

# # Load precaution data
# precaution_df = pd.read_csv(r'datasets\precaution_updated_with_lifestyle.csv')
# precaution_df.columns = precaution_df.columns.str.strip()
# precaution_df['Disease'] = precaution_df['Disease'].str.strip().str.lower()
# precaution_df['All_Precautions'] = precaution_df['All_Precautions'].fillna('')

# # Load description data
# desc_df = pd.read_csv(r"datasets\Modified_Symptom_Description_with_PatientInfo.csv")
# desc_df['Disease'] = desc_df['Disease'].str.lower().str.strip()
# description_map = dict(zip(desc_df['Disease'], desc_df['Description']))

# def get_precautions(disease_name):
#     disease_name = disease_name.strip().lower()
#     row = precaution_df[precaution_df['Disease'] == disease_name]
#     if row.empty:
#         return ["No precautions found."]

#     precaution_text = row.iloc[0]['All_Precautions']
#     precautions = [p.strip() for p in precaution_text.split(',') if p.strip()]
#     return precautions

# def allowed_file(filename):
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def preprocess_image(file_path):
#     """
#     Preprocess the image for the model
#     Adjust parameters according to your model's requirements
#     """
#     img = image.load_img(file_path, target_size=(224, 224))  # Adjust size as needed
#     img_array = image.img_to_array(img)
#     img_array = np.expand_dims(img_array, axis=0)
#     img_array = img_array / 255.0  # Normalize pixel values
#     return img_array

# @app.route('/predict', methods=['POST'])
# def predict():
#     # Get data from request
#     data = request.json
    
#     # Extract features
#     name = data.get('name', '')
#     symptoms = data.get('symptoms', '')
#     age = int(data.get('age', 30))
#     gender_text = data.get('gender', 'male').lower()
#     gender = 1 if gender_text == 'female' else 0
#     stage = int(data.get('stage', 1))
#     smoker = int(data.get('smoker', False))
#     diabetes = int(data.get('diabetes', False))
#     hypertension = int(data.get('hypertension', False))
#     heart_disease = int(data.get('heart_disease', False))
    
#     # Process symptom text
#     symptom_vector = tfidf.transform([symptoms])
    
#     # Combine with numerical features
#     num_features = np.array([[age, gender, stage, smoker, diabetes, hypertension, heart_disease]])
#     X_pred = hstack([symptom_vector, num_features])
    
#     # Get probability distribution
#     probs = model.predict_proba(X_pred)[0]
    
#     # Get top 3 predictions with confidence
#     top_indices = probs.argsort()[-3:][::-1]
#     predictions = []
    
#     for idx in top_indices:
#         disease = le_disease.inverse_transform([idx])[0]
#         confidence = probs[idx] * 100
#         description = description_map.get(disease.lower(), "No description available.")
#         precautions = get_precautions(disease)
        
#         # Custom recommendations based on medical conditions
#         custom_recs = []
#         if smoker == 1:
#             custom_recs.append("Consider a smoking cessation program to improve overall health")
#         if diabetes == 1:
#             custom_recs.append("Monitor blood sugar levels regularly")
#         if hypertension == 1:
#             custom_recs.append("Follow a low-sodium diet and take prescribed blood pressure medications")
#         if heart_disease == 1:
#             custom_recs.append("Regular cardiac check-ups and follow heart-healthy diet")
        
#         predictions.append({
#             'disease': disease,
#             'confidence': float(confidence),
#             'description': description,
#             'precautions': precautions,
#             'custom_recommendations': custom_recs
#         })
    
#     return jsonify({
#         'predictions': predictions,
#         'input': {
#             'name': name,
#             'symptoms': symptoms,
#             'age': age,
#             'gender': 'Female' if gender == 1 else 'Male',
#             'stage': stage,
#             'smoker': bool(smoker),
#             'diabetes': bool(diabetes),
#             'hypertension': bool(hypertension),
#             'heart_disease': bool(heart_disease)
#         }
#     })

# @app.route('/predict_xray', methods=['POST'])
# def predict_xray():
#     # Check if the post request has the file part
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'})
    
#     file = request.files['file']
    
#     # If user does not select file, browser also
#     # submit an empty part without filename
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'})
    
#     if file and allowed_file(file.filename):
#         # Secure the filename and save the file
#         filename = secure_filename(file.filename)
#         filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#         file.save(filepath)
        
#         # Get patient information if available
#         name = request.form.get('name', '')
#         age = request.form.get('age', '0')
#         gender = request.form.get('gender', 'unknown')
        
#         try:
#             # Preprocess the image
#             processed_image = preprocess_image(filepath)
            
#             # Make prediction
#             prediction = chest_xray_model.predict(processed_image)
            
#             # Process prediction results
#             # Adapt this section based on your model's output format
#             if len(prediction[0]) > 1:  # Multi-class classification
#                 classes = ['class1', 'class2', 'class3']  # Replace with your actual class names
#                 result_class = classes[np.argmax(prediction[0])]
#                 confidence = float(prediction[0][np.argmax(prediction[0])] * 100)
#             else:  # Binary classification
#                 result_class = 'Abnormal' if prediction[0][0] > 0.5 else 'Normal'
#                 confidence = float(prediction[0][0] * 100) if result_class == 'Abnormal' else float((1 - prediction[0][0]) * 100)
            
#             # Get relevant descriptions and precautions if available
#             description = description_map.get(result_class.lower(), "No specific description available for this condition.")
#             precautions = get_precautions(result_class)
            
#             # Create result object
#             result = {
#                 'prediction': result_class,
#                 'confidence': confidence,
#                 'description': description,
#                 'precautions': precautions,
#                 'patient_info': {
#                     'name': name,
#                     'age': age,
#                     'gender': gender
#                 },
#                 'image_path': filename  # Store the filename for reference
#             }
            
#             return jsonify(result)
            
#         except Exception as e:
#             app.logger.error(f"Error processing image: {str(e)}")
#             return jsonify({
#                 'error': 'Error processing image',
#                 'details': str(e)
#             }), 500
    
#     return jsonify({'error': 'File type not allowed'}), 400

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/form')
# def form():
#     return render_template('form.html')

# @app.route('/result')
# def result():
#     return render_template('result.html')

# @app.route('/upload')
# def upload():
#     return render_template('upload.html')

# @app.route('/final')
# def xray_result():
#     return render_template('final.html')

# if __name__ == '__main__':
#     app.run(debug=True)