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
            return response.text().then(msg => { throw new Error(msg); });
          }
          return response.text();
        })
        .then(msg => {
          alert("✅ " + msg);
          window.location.href = "login.html";
        })
        .catch(error => {
          const msg = document.getElementById("mensaje-error");
          if (msg) {
            msg.textContent = "❌ " + error.message;
          } else {
            alert("❌ " + error.message);
          }
        });
    });
  }
});
