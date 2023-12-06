// Función para manejar errores de AJAX
function handleAjaxError(jqXHR, textStatus, errorThrown) {
    console.error('AJAX error: ' + textStatus + ', ' + errorThrown);
}

// Función para mostrar mensajes de éxito
function showSuccessMessage(message) {
    var successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// Función para mostrar mensajes de error
function showErrorMessage(message) {
    var errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Función para ocultar mensajes de éxito y error
function clearMessages() {
    var successDiv = document.getElementById('success-message');
    var errorDiv = document.getElementById('error-message');
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';
}