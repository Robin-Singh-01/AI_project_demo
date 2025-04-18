document.addEventListener('DOMContentLoaded', function() {
    // Handle scan type parameter
    const urlParams = new URLSearchParams(window.location.search);
    const scanType = urlParams.get('type');
    
    if (scanType === 'scan') {
        localStorage.setItem('uploadType', 'scan');
    }
});