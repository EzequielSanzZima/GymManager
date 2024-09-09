document.addEventListener('DOMContentLoaded', function() {
    let successAlert = document.getElementById('successAlert');
    let errorAlert = document.getElementById('errorAlert');
    
    if (successAlert.innerHTML.trim() !== '') {
        successAlert.classList.add('show');
    }
    if (errorAlert.innerHTML.trim() !== '') {
        errorAlert.classList.add('show');
    }
});