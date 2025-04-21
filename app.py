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

if __name__ == '__main__':
    app.run(debug=True)