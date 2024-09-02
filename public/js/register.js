document.addEventListener('DOMContentLoaded', function() {
    var successAlert = document.getElementById('successAlert');
    var errorAlert = document.getElementById('errorAlert');
    
    if (successAlert.innerHTML.trim() !== '') {
        successAlert.classList.add('show');
    }
    if (errorAlert.innerHTML.trim() !== '') {
        errorAlert.classList.add('show');
    }
});