document.addEventListener('DOMContentLoaded', function() {
    // Retrieve all stored data
    const healthData = JSON.parse(localStorage.getItem('healthData'));
    const riskScores = JSON.parse(localStorage.getItem('riskScores'));
    const imageAnalysis = JSON.parse(localStorage.getItem('imageAnalysis'));

    // Display personal information
    displayPersonalInfo(healthData);

    // Display risk summary
    displayRiskSummary(riskScores);

    // Display imaging results if available
    if (imageAnalysis) {
        displayImagingResults(imageAnalysis);
    }

    // Generate and display recommendations
    displayRecommendations(healthData, riskScores, imageAnalysis);

    // Setup button handlers
    setupButtons();
});

function displayPersonalInfo(data) {
    const personalInfoDiv = document.getElementById('personalInfo');
    personalInfoDiv.innerHTML = `
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> ${data.personalInfo.name}</p>
        <p><strong>Age:</strong> ${data.personalInfo.age}</p>
        <p><strong>Gender:</strong> ${data.personalInfo.gender}</p>
    `;
}

function displayRiskSummary(scores) {
    const riskSummaryDiv = document.getElementById('riskSummary');
    let html = '<h3>Risk Assessment</h3>';
    
    for (const [condition, score] of Object.entries(scores)) {
        const riskLevel = getRiskLevel(score);
        html += `
            <div class="risk-item ${riskLevel.toLowerCase()}">
                <span class="condition">${formatConditionName(condition)}</span>
                <span class="score">${score}% - ${riskLevel} Risk</span>
            </div>
        `;
    }
    
    riskSummaryDiv.innerHTML = html;
}

function displayImagingResults(analysis) {
    const imagingDiv = document.getElementById('imagingResults');
    imagingDiv.innerHTML = `
        <h3>Imaging Analysis</h3>
        <p class="analysis-result">${analysis.conclusion}</p>
        <div class="findings">
            ${analysis.findings.map(finding => `<p>• ${finding}</p>`).join('')}
        </div>
    `;
}

function displayRecommendations(healthData, riskScores, imageAnalysis) {
    const mainRecommendation = document.getElementById('mainRecommendation');
    const lifestyleTips = document.getElementById('lifestyleTips');

    // Determine urgency level
    const hasHighRisk = Object.values(riskScores).some(score => score > 70);
    const hasImaging = imageAnalysis && imageAnalysis.urgency === 'high';

    if (hasHighRisk || hasImaging) {
        mainRecommendation.innerHTML = `
            <h3 class="urgent">Medical Attention Required</h3>
            <p>Based on your assessment, we strongly recommend immediate medical consultation.</p>
        `;
    } else {
        mainRecommendation.innerHTML = `
            <h3 class="normal">Preventive Care Recommended</h3>
            <p>Your results suggest maintaining current health practices with regular check-ups.</p>
        `;
    }

    // Generate lifestyle tips
    generateLifestyleTips(healthData, lifestyleTips);
}

function generateLifestyleTips(healthData, container) {
    const tips = [];

    // Exercise recommendations
    if (healthData.lifestyle.exercise < 3) {
        tips.push({
            title: 'Increase Physical Activity',
            content: 'Aim for at least 150 minutes of moderate exercise per week.'
        });
    }

    // Smoking recommendations
    if (healthData.lifestyle.smoking === 'current') {
        tips.push({
            title: 'Quit Smoking',
            content: 'Consider smoking cessation programs and consult your doctor for support.'
        });
    }

    // Display tips
    container.innerHTML = `
        <h3>Lifestyle Recommendations</h3>
        ${tips.map(tip => `
            <div class="tip-card">
                <h4>${tip.title}</h4>
                <p>${tip.content}</p>
            </div>
        `).join('')}
    `;
}

function setupButtons() {
    const downloadBtn = document.getElementById('downloadPDF');
    const startOverBtn = document.getElementById('startOver');

    downloadBtn.addEventListener('click', generatePDF);
    startOverBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.setFontSize(16);
    doc.text('Health Assessment Report', 20, 20);
    
    // Add more content...
    
    doc.save('health-assessment-report.pdf');
}

function getRiskLevel(score) {
    if (score >= 70) return 'High';
    if (score >= 30) return 'Moderate';
    return 'Low';
}

function formatConditionName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}