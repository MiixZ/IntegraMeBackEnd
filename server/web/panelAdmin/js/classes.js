document.getElementById('classesForm').addEventListener('submit', function(event) {
  event.preventDefault();

  var className = document.getElementById('className').value;
  var classDescription = document.getElementById('classDescription').value;

  if (className && classDescription) {
    // Aquí podrías hacer una llamada AJAX para enviar los datos al servidor
    console.log('Nombre de la clase: ' + className);
    console.log('Descripción de la clase: ' + classDescription);
  } else {
    alert('Por favor, completa todos los campos del formulario.');
  }
});