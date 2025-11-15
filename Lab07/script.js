// Validación de formulario
document.getElementById("validarBtn").addEventListener("click", function () {
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const mensaje = document.getElementById("mensaje");

  if (nombre === "" || apellido === "") {
    mensaje.textContent = "Debe completar todos los campos.";
    mensaje.style.color = "red";
  } else {
    mensaje.textContent = `Bienvenido, ${nombre} ${apellido}`;
    mensaje.style.color = "green";
  }
});

// jQuery: Agregar y quitar clase
$("#agregarClase").click(function () {
  $("#bloqueTexto").addClass("color");
});

$("#quitarClase").click(function () {
  $("#bloqueTexto").removeClass("color");
});

// jQuery: Mostrar y ocultar elemento
$("#mostrarOcultar").click(function () {
  $("#elementoOculto").toggle();
});
