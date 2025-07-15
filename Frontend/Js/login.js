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
            if (res.status === 401) throw new Error("❌ Contraseña incorrecta");
            if (res.status === 404) throw new Error("❌ Correo no registrado");
            throw new Error("❌ Error desconocido");
          }
          return res.json();
        })
        .then(usuario => {
          // 🔒 Guardar el usuario en localStorage
          localStorage.setItem("usuario", JSON.stringify(usuario));

          // ✅ Mostrar bienvenida
          Swal.fire({
            title: `¡Bienvenido/a, ${usuario.nombre}!`,
            icon: "success",
            text: "Has iniciado sesión correctamente.",
            background: "#1e1e1e",
            color: "#ffffff",
            confirmButtonColor: "#205e5b"
          }).then(() => {
            window.location.href = "../Pages/inicio.html";
          });
        })
        .catch(error => {
          // ❌ Mostrar error con fondo oscuro
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
            background: "#1e1e1e",
            color: "#ffffff",
            confirmButtonColor: "#d33"
          });
        });
    });
  } else {
    console.warn("⚠️ No se encontró el formulario con id='loginForm'");
  }
});
