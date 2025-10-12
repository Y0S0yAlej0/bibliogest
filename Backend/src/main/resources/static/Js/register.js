document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registroForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = {
        nombre: document.getElementById("nombre").value,
        correo: document.getElementById("correo").value,
        contrasena: document.getElementById("contraseña").value,
        numero: document.getElementById("numero").value
      };

      fetch("http://localhost:8080/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(msg => {
              throw new Error(msg);
            });
          }
          return response.text();
        })
        .then(msg => {
          // ✅ Registro exitoso
          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: msg,
            confirmButtonColor: '#205e5b',
            background: '#1e1e1e',
            color: '#fff'
          }).then(() => {
            window.location.href = "../index.html";
          });
        })
        .catch(error => {
          if (error.message.includes("correo ya registrado") || error.message.includes("ya existe")) {
            // ⚠️ Correo en uso
            Swal.fire({
              icon: 'warning',
              title: 'Correo ya registrado',
              text: 'Por favor usa otro correo electrónico.',
              confirmButtonColor: '#f1c40f',
              background: '#1e1e1e',
              color: '#fff'
            });
          } else {
            // ❌ Error general
            Swal.fire({
              icon: 'error',
              title: 'Error al registrar',
              text: error.message || "Ocurrió un problema inesperado.",
              confirmButtonColor: '#e74c3c',
              background: '#1e1e1e',
              color: '#fff'
            });
          }
        });
    });
  }
});
