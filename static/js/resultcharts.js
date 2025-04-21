// document.addEventListener('DOMContentLoaded', function() {
//     // Get risk data from localStorage
//     const riskScores = JSON.parse(localStorage.getItem('riskScores')) || {
//         heartDisease: 0,
//         diabetes: 0,
//         stroke: 0
//     };

//     // Create risk table
//     createRiskTable(riskScores);
    
//     // Create chart
//     createRiskChart(riskScores);
    
//     // Show appropriate buttons based on risk levels
//     handleNavigationButtons(riskScores);
// });

// function createRiskTable(scores) {
//     const tableDiv = document.getElementById('riskTable');
//     let html = `
//         <table class="risk-table">
//             <thead>
//                 <tr>
//                     <th>Condition</th>
//                     <th>Risk Level</th>
//                     <th>Status</th>
//                 </tr>
//             </thead>
//             <tbody>
//     `;

//     for (const [condition, score] of Object.entries(scores)) {
//         const status = getRiskStatus(score);
//         html += `
//             <tr>
//                 <td>${formatConditionName(condition)}</td>
//                 <td>${score}%</td>
//                 <td class="risk-${status.toLowerCase()}">${status}</td>
//             </tr>
//         `;
//     }

//     html += '</tbody></table>';
//     tableDiv.innerHTML = html;
// }

// function createRiskChart(scores) {
//     const ctx = document.getElementById('riskChart').getContext('2d');
//     new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: Object.keys(scores).map(formatConditionName),
//             datasets: [{
//                 label: 'Risk Percentage',
//                 data: Object.values(scores),
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.5)',
//                     'rgba(54, 162, 235, 0.5)',
//                     'rgba(255, 206, 86, 0.5)'
//                 ],
//                 borderColor: [
//                     'rgba(255, 99, 132, 1)',
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     max: 100
//                 }
//             }
//         }
//     });
// }

// function handleNavigationButtons(scores) {
//     const uploadButton = document.getElementById('uploadButton');
//     const finalButton = document.getElementById('finalButton');
    
//     // If any risk is high (> 70%), show upload button
//     const hasHighRisk = Object.values(scores).some(score => score > 70);
    
//     if (hasHighRisk) {
//         uploadButton.style.display = 'block';
//         uploadButton.addEventListener('click', () => {
//             window.location.href = 'upload.html';
//         });
//     } else {
//         finalButton.style.display = 'block';
//         finalButton.addEventListener('click', () => {
//             window.location.href = 'final.html';
//         });
//     }
// }

// function getRiskStatus(score) {
//     if (score >= 70) return 'High';
//     if (score >= 30) return 'Moderate';
//     return 'Low';
// }

// function formatConditionName(name) {
//     return name
//         .replace(/([A-Z])/g, ' $1')
//         .replace(/^./, str => str.toUpperCase());
// }

document.addEventListener('DOMContentLoaded', function() {
    // Get prediction results from localStorage
    const predictionResults = JSON.parse(localStorage.getItem('predictionResults')) || {
        predictions: [],
        input: {}
    };
    
    // Create results table
    createResultsTable(predictionResults);
    
    // Create chart based on prediction results
    createPredictionChart(predictionResults);
    
    // Show appropriate buttons based on highest confidence disease
    handleNavigationButtons(predictionResults);
    
    // Display patient information
    displayPatientInfo(predictionResults.input);
});

function createResultsTable(results) {
    const tableDiv = document.getElementById('riskTable');
    if (!results.predictions || results.predictions.length === 0) {
        tableDiv.innerHTML = '<p>No prediction results available.</p>';
        return;
    }
    
    let html = `
        <table class="risk-table">
            <thead>
                <tr>
                    <th>Disease</th>
                    <th>Confidence</th>
                    <th>Risk Level</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.predictions.forEach(prediction => {
        const status = getRiskStatus(prediction.confidence);
        html += `
            <tr>
                <td>${prediction.disease}</td>
                <td>${prediction.confidence.toFixed(1)}%</td>
                <td class="risk-${status.toLowerCase()}">${status}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    tableDiv.innerHTML = html;
    
    // Display the first (most likely) disease's description and precautions
    if (results.predictions.length > 0) {
        displayDiseaseDetails(results.predictions[0]);
    }
}

function displayDiseaseDetails(prediction) {
    const detailsDiv = document.getElementById('diseaseDetails') || document.createElement('div');
    detailsDiv.id = 'diseaseDetails';
    detailsDiv.className = 'disease-details-section';
    
    let html = `
        <h3>Disease Details: ${prediction.disease}</h3>
        <div class="disease-details">
            <h4>Description:</h4>
            <p>${prediction.description}</p>
            <h4>Precautions:</h4>
            <ul>
    `;
    
    prediction.precautions.forEach(precaution => {
        html += `<li>${precaution}</li>`;
    });
    
    html += '</ul>';
    
    if (prediction.custom_recommendations && prediction.custom_recommendations.length > 0) {
        html += '<h4>Custom Recommendations:</h4><ul>';
        prediction.custom_recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
        });
        html += '</ul>';
    }
    
    html += '</div>';
    detailsDiv.innerHTML = html;
    
    const container = document.querySelector('main');
    const vizSection = document.querySelector('.risk-visualization');
    container.insertBefore(detailsDiv, vizSection);
}

function displayPatientInfo(patientData) {
    const infoDiv = document.getElementById('patientInfo') || document.createElement('div');
    infoDiv.id = 'patientInfo';
    infoDiv.className = 'patient-info-section';
    
    let html = `
        <h3>Patient Information</h3>
        <div class="patient-info">
            <table>
                <tr><td><strong>Name:</strong></td><td>${patientData.name || 'N/A'}</td></tr>
                <tr><td><strong>Age:</strong></td><td>${patientData.age || 'N/A'}</td></tr>
                <tr><td><strong>Gender:</strong></td><td>${patientData.gender || 'N/A'}</td></tr>
            </table>
            <table>
                <tr><td colspan="2"><strong>Medical Conditions:</strong></td></tr>
    `;
    
    const conditions = [];
    if (patientData.smoker) conditions.push('Smoker');
    if (patientData.diabetes) conditions.push('Diabetes');
    if (patientData.hypertension) conditions.push('Hypertension');
    if (patientData.heart_disease) conditions.push('Heart Disease');
    
    html += `<tr><td colspan="2">${conditions.length > 0 ? conditions.join(', ') : 'None reported'}</td></tr>
            </table>
        </div>
    `;
    
    infoDiv.innerHTML = html;
    
    const container = document.querySelector('main');
    const firstSection = container.querySelector('section');
    container.insertBefore(infoDiv, firstSection);
}

function createPredictionChart(results) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    
    if (!results.predictions || results.predictions.length === 0) {
        ctx.canvas.style.display = 'none';
        return;
    }
    
    // Extract disease names and confidence scores
    const diseases = results.predictions.map(p => p.disease);
    const confidences = results.predictions.map(p => p.confidence);
    
    // Generate colors based on confidence levels
    const backgroundColor = confidences.map(score => {
        if (score >= 70) return 'rgba(255, 99, 132, 0.5)'; // High - Red
        if (score >= 30) return 'rgba(255, 206, 86, 0.5)'; // Moderate - Yellow
        return 'rgba(75, 192, 192, 0.5)'; // Low - Green
    });
    
    const borderColor = confidences.map(score => {
        if (score >= 70) return 'rgba(255, 99, 132, 1)';
        if (score >= 30) return 'rgba(255, 206, 86, 1)';
        return 'rgba(75, 192, 192, 1)';
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: diseases,
            datasets: [{
                label: 'Confidence (%)',
                data: confidences,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Confidence (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Potential Diseases'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Disease Prediction Results',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Confidence: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

function handleNavigationButtons(results) {
    const uploadButton = document.getElementById('uploadButton');
    const finalButton = document.getElementById('finalButton');
    
    if (!results.predictions || results.predictions.length === 0) {
        // Default to final button if no predictions
        if (finalButton) finalButton.style.display = 'block';
        if (uploadButton) uploadButton.style.display = 'none';
        return;
    }
    
    // If highest confidence prediction is > 70%, show upload button
    const highestConfidence = results.predictions[0].confidence;
    
    if (highestConfidence > 70) {
        if (uploadButton) {
            uploadButton.style.display = 'block';
            uploadButton.addEventListener('click', () => {
                window.location.href = 'upload.html';
            });
        }
        if (finalButton) finalButton.style.display = 'none';
    } else {
        if (finalButton) {
            finalButton.style.display = 'block';
            finalButton.addEventListener('click', () => {
                window.location.href = 'final.html';
            });
        }
        if (uploadButton) uploadButton.style.display = 'none';
    }
}

function getRiskStatus(confidence) {
    if (confidence >= 70) return 'High';
    if (confidence >= 30) return 'Moderate';
    return 'Low';
}