document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const correo = document.getElementById("correo").value.trim().toLowerCase();
      const contrasena = document.getElementById("contrasena").value.trim();

      console.log("📧 Correo:", correo);
      console.log("🔑 Contraseña:", contrasena);

      const data = {
        correo: correo,
        contrasena: contrasena
      };

      fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(res => {
          console.log("📡 Status:", res.status);
          if (!res.ok) {
            return res.text().then(msg => {
              if (res.status === 401) throw new Error("❌ Contraseña incorrecta");
              if (res.status === 404) throw new Error("❌ Correo no registrado");
              throw new Error(msg || "❌ Error desconocido");
            });
          }
          return res.json();
        })
        .then(usuario => {
          console.log("✅ Usuario logueado:", usuario);
          localStorage.setItem("usuario", JSON.stringify(usuario));

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
          console.error("❌ Error:", error);
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