document.getElementById('student-form').addEventListener('submit', function(event) {
  event.preventDefault();

  var studentName = document.getElementById('student-name').value;
  var studentAge = document.getElementById('student-age').value;
  var studentClass = document.getElementById('student-class').value;

  if (studentName && studentAge && studentClass) {
    // Aquí podrías hacer algo con los datos del estudiante, como enviarlos a un servidor
    console.log('Nombre del estudiante: ' + studentName);
    console.log('Edad del estudiante: ' + studentAge);
    console.log('Clase del estudiante: ' + studentClass);
  } else {
    alert('Por favor, completa todos los campos del formulario.');
  }
});