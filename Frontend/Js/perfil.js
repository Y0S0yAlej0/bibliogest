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

  // Activar edición al hacer clic en el lápiz
  document.querySelectorAll(".icono-editar").forEach(icono => {
    icono.addEventListener("click", () => {
      const campoId = icono.dataset.target;
      const input = document.getElementById(campoId);
      input.disabled = false;
      input.focus();
      icono.style.display = "none";
    });
  });

  // Enviar datos actualizados
  document.getElementById("perfilForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const datosActualizados = {
      id: usuario.id,
      nombre: document.getElementById("nombre").value,
      correo: document.getElementById("correo").value,
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
      localStorage.setItem("usuario", JSON.stringify(res)); // actualiza localStorage
      location.reload(); // recarga la página para volver a desactivar los campos
    })
    .catch(err => {
      alert("❌ Error: " + err.message);
    });
  });
});
