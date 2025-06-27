document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = {
        correo: document.getElementById("correo").value,
        contrasena: document.getElementById("contrasena").value
      };

      fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 401) throw new Error("Contraseña incorrecta");
            if (res.status === 404) throw new Error("Correo no registrado");
            throw new Error("Error desconocido");
          }
          return res.json();
        })
        .then(usuario => {
          alert("✅ Bienvenido " + usuario.nombre);
           window.location.href = "../Pages/inicio.html"; // ajusta esta ruta a la tuya
        })
        .catch(error => {
          document.getElementById("mensaje-error").textContent = error.message;
        });
    });
  } else {
    console.warn("⚠️ No se encontró el formulario con id='loginForm'");
  }
});