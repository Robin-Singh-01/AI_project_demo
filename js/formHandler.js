document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('healthForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Collect form data
        const formData = new FormData(form);
        const data = {
            personalInfo: {
                name: formData.get('name'),
                age: parseInt(formData.get('age')),
                gender: formData.get('gender')
            },
            symptoms: formData.get('symptoms'),
            lifestyle: {
                smoking: formData.get('smoking'),
                exercise: parseInt(formData.get('exercise')),
                conditions: Array.from(formData.getAll('conditions'))
            }
        };

        try {
            // Mock API response
            const response = {
                heartDisease: 20,
                diabetes: 30,
                stroke: 10
            };

            // Store risk scores
            localStorage.setItem('riskScores', JSON.stringify(response));
            
            // Redirect to results page
            window.location.href = 'result.html';
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error processing your data. Please try again.');
        }
    });
});