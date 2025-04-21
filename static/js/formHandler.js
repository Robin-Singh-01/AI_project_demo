// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('healthForm');

//     form.addEventListener('submit', async function(e) {
//         e.preventDefault();

//         // Collect form data
//         const formData = new FormData(form);
        
//         // Prepare data in the format expected by your API
//         const data = {
//             name: formData.get('name'),
//             age: parseInt(formData.get('age')),
//             gender: formData.get('gender'),
//             symptoms: formData.get('symptoms'),
//             stage: parseInt(formData.get('stage') || '1'), // Default to stage 1 if not present
//             smoker: formData.get('smoking') === 'yes', // Convert to boolean
//             diabetes: formData.getAll('conditions').includes('diabetes'),
//             hypertension: formData.getAll('conditions').includes('hypertension'),
//             heart_disease: formData.getAll('conditions').includes('heart_disease')
//         };

//         try {
//             // Call the real API endpoint
//             const response = await fetch('http://127.0.0.1:5000/predict', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(data)
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             // Get prediction results
//             const predictionResults = await response.json();
            
//             // Store prediction results
//             localStorage.setItem('predictionResults', JSON.stringify(predictionResults));
            
//             // Redirect to results page
//             window.location.href = 'result.html';
//         } catch (error) {
//             console.error('Error:', error);
//             alert('There was an error processing your data. Please try again.');
//         }
//     });
// });

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('healthForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);

        const data = {
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            symptoms: formData.get('symptoms')?.trim() || "",
            stage: parseInt(formData.get('stage') || '1'),
            smoker: ['current', 'former'].includes(formData.get('smoking')) ? 1 : 0,
            diabetes: formData.getAll('conditions').includes('diabetes') ? 1 : 0,
            hypertension: formData.getAll('conditions').includes('hypertension') ? 1 : 0,
            heart_disease: formData.getAll('conditions').includes('heart') ? 1 : 0
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const predictionResults = await response.json();
            localStorage.setItem('predictionResults', JSON.stringify(predictionResults));
            window.location.href = '/result';
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error processing your data. Please try again.');
        }
    });
});
