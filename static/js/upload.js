document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('imageUpload');
    const preview = document.getElementById('preview');
    const submitButton = document.getElementById('submitUpload');

    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('highlight');
    }

    function unhighlight(e) {
        dropZone.classList.remove('highlight');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                submitButton.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }

    submitButton.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Analyzing...';

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Get patient info from localStorage
            const healthData = JSON.parse(localStorage.getItem('healthData')) || {};
            const personalInfo = healthData.personalInfo || {};
            
            // Add to form data
            if (personalInfo.name) formData.append('name', personalInfo.name);
            if (personalInfo.age) formData.append('age', personalInfo.age);
            if (personalInfo.gender) formData.append('gender', personalInfo.gender);

            const response = await fetch('/predict_xray', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            
            // Format the data to match the expected format in final.js
            const imageAnalysis = {
                conclusion: result.prediction,
                urgency: result.confidence > 70 ? 'high' : 'moderate',
                findings: [
                    result.description,
                    ...result.precautions
                ].filter(item => item && item.trim() !== '')
            };
            
            // Store in localStorage for final.js to use
            localStorage.setItem('imageAnalysis', JSON.stringify(imageAnalysis));
            
            // Navigate to the final results page
            window.location.href = 'final.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Analyze Image';
        }
    });
});