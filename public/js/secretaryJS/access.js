document.addEventListener('DOMContentLoaded', function() {
    const errorAlert = document.getElementById('errorAlert');
    
    if (errorAlert && errorAlert.innerHTML.trim() !== '') {
        errorAlert.classList.add('show');
        
        setTimeout(function() {
            if (errorAlert && errorAlert.classList.contains('show')) {
                errorAlert.classList.remove('show');
            }
        }, 5000);
    }
});