// JS/SLIDEBAR.JS
document.addEventListener("DOMContentLoaded", function () {
  fetch("../Components/slidebar.html")
    .then(res => res.text())
    .then(data => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data;
      document.body.prepend(tempDiv);

      const toggleBtn = document.getElementById("toggleBtn");
      const sidebar = document.getElementById("sidebar");

      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
      });

      // Verifica si hay un usuario almacenado en localStorage
      const usuarioJSON = localStorage.getItem("usuario");
      if (usuarioJSON) {
        const usuario = JSON.parse(usuarioJSON);

        if (usuario && usuario.rol && usuario.rol.toLowerCase() === "admin") {
          const adminLink = document.getElementById("adminLink");
          if (adminLink) adminLink.style.display = "block";
        } else {
          console.log("⚠️ Usuario no es administrador o no está logueado");
        }
      } else {
        console.log("⚠️ No hay usuario en localStorage");
      }

      // Cerrar sesión con estilo oscuro
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          Swal.fire({
            title: '¿Estás seguro?',
            text: 'Tu sesión se cerrará.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            background: '#1e1e1e',
            color: '#ffffff',
            confirmButtonColor: '#205e5b',
            cancelButtonColor: '#d33',
            iconColor: '#f8bb86'
          }).then((result) => {
            if (result.isConfirmed) {
              localStorage.removeItem("usuario");
              Swal.fire({
                title: 'Cerrando sesión...',
                background: '#1e1e1e',
                color: '#ffffff',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
              }).then(() => {
                window.location.href = "index.html";
              });
            }
          });
        });
      }
    });
});
