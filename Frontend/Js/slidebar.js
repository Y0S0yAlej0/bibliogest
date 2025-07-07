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
    });
});
