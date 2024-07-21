document.addEventListener('DOMContentLoaded', function () {
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function () {
            var deleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
            deleteModal.show();
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            fetch('/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    window.location.href = '/register';
                } else {
                    alert('Error al eliminar la cuenta.');
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar la cuenta.');
            });
        });
    }
});