document.addEventListener("DOMContentLoaded", function() {
    const changePasswordForm = document.getElementById("changePasswordForm");
    const messageDiv = document.getElementById("message");

    changePasswordForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const formData = new FormData(changePasswordForm);
        const data = {
            currentPassword: formData.get("currentPassword"),
            newPassword: formData.get("newPassword"),
            confirmNewPassword: formData.get("confirmNewPassword"),
        };

        try {
            const response = await fetch("/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            messageDiv.style.display = "block";

            if (response.ok) {
                messageDiv.className = "alert alert-success";
                messageDiv.innerText = result.message;
                changePasswordForm.reset();
            } else {
                messageDiv.className = "alert alert-danger";
                messageDiv.innerText = result.error;
            }
        } catch (error) {
            messageDiv.style.display = "block";
            messageDiv.className = "alert alert-danger";
            messageDiv.innerText = "Ocurrió un error al cambiar la contraseña.";
        }
    });
});