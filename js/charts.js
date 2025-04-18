document.addEventListener('DOMContentLoaded', function() {
    // Get risk data from localStorage
    const riskScores = JSON.parse(localStorage.getItem('riskScores')) || {
        heartDisease: 0,
        diabetes: 0,
        stroke: 0
    };

    // Create risk table
    createRiskTable(riskScores);
    
    // Create chart
    createRiskChart(riskScores);
    
    // Show appropriate buttons based on risk levels
    handleNavigationButtons(riskScores);
});

function createRiskTable(scores) {
    const tableDiv = document.getElementById('riskTable');
    let html = `
        <table class="risk-table">
            <thead>
                <tr>
                    <th>Condition</th>
                    <th>Risk Level</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [condition, score] of Object.entries(scores)) {
        const status = getRiskStatus(score);
        html += `
            <tr>
                <td>${formatConditionName(condition)}</td>
                <td>${score}%</td>
                <td class="risk-${status.toLowerCase()}">${status}</td>
            </tr>
        `;
    }

    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}

function createRiskChart(scores) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(scores).map(formatConditionName),
            datasets: [{
                label: 'Risk Percentage',
                data: Object.values(scores),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function handleNavigationButtons(scores) {
    const uploadButton = document.getElementById('uploadButton');
    const finalButton = document.getElementById('finalButton');
    
    // If any risk is high (> 70%), show upload button
    const hasHighRisk = Object.values(scores).some(score => score > 70);
    
    if (hasHighRisk) {
        uploadButton.style.display = 'block';
        uploadButton.addEventListener('click', () => {
            window.location.href = 'upload.html';
        });
    } else {
        finalButton.style.display = 'block';
        finalButton.addEventListener('click', () => {
            window.location.href = 'final.html';
        });
    }
}

function getRiskStatus(score) {
    if (score >= 70) return 'High';
    if (score >= 30) return 'Moderate';
    return 'Low';
}

function formatConditionName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}