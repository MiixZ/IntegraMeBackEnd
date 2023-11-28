document.getElementById('teacher-form').addEventListener('submit', function(event) {
  event.preventDefault();

  var teacherName = document.getElementById('teacher-name').value;
  var teacherEmail = document.getElementById('teacher-email').value;
  var teacherSubject = document.getElementById('teacher-subject').value;

  if (teacherName && teacherEmail && teacherSubject) {
    // Aquí podrías hacer una llamada AJAX para enviar los datos al servidor
    console.log('Nombre del profesor: ' + teacherName);
    console.log('Email del profesor: ' + teacherEmail);
    console.log('Materia del profesor: ' + teacherSubject);
  } else {
    alert('Por favor, completa todos los campos del formulario.');
  }
});