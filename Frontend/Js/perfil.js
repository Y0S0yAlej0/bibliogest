document.addEventListener("DOMContentLoaded", function () {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    alert("⚠️ No hay usuario en sesión.");
    window.location.href = "login.html";
    return;
  }

  // Cargar datos en el formulario
  document.getElementById("nombre").value = usuario.nombre || "";
  document.getElementById("correo").value = usuario.correo || "";
  document.getElementById("numero").value = usuario.numero || "";
  document.getElementById("contrasena").value = usuario.contrasena || "";

  // Referencia al input de correo
  const inputCorreo = document.getElementById("correo");

  // Activar edición al hacer clic en el lápiz
  document.querySelectorAll(".icono-editar").forEach(icono => {
    icono.addEventListener("click", () => {
      const campoId = icono.dataset.target;
      const input = document.getElementById(campoId);

      if (campoId === "correo") {
        mostrarMensajeCorreo("⚠️ No puedes editar el correo");
        return;
      }

      input.disabled = false;
      input.focus();
      icono.style.display = "none";

      // Cuando el usuario salga del campo, vuelve a mostrar el ícono
      input.addEventListener("blur", () => {
        input.disabled = true;
        icono.style.display = "inline";
      }, { once: true });
    });
  });

  // Enviar datos actualizados
  document.getElementById("perfilForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const datosActualizados = {
      id: usuario.id,
      nombre: document.getElementById("nombre").value,
      correo: usuario.correo, // no editable
      numero: document.getElementById("numero").value,
      contrasena: document.getElementById("contrasena").value
    };

    fetch("http://localhost:8080/api/usuarios/" + usuario.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datosActualizados)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al actualizar el perfil");
        return res.json();
      })
      .then(res => {
        alert("✅ Perfil actualizado correctamente");
        localStorage.setItem("usuario", JSON.stringify(res));
        location.reload();
      })
      .catch(err => {
        alert("❌ Error: " + err.message);
      });
  });

  // Mostrar mensaje debajo del campo correo sin empujar el diseño
function mostrarMensajeCorreo(mensaje) {
  const mensajeEl = document.getElementById("mensajeCorreo");
  mensajeEl.textContent = mensaje;
  mensajeEl.style.display = "block";

  setTimeout(() => {
    mensajeEl.style.display = "none";
  }, 3000);
} });
