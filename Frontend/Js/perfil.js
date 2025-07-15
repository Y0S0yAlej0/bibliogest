document.addEventListener("DOMContentLoaded", function () {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    Swal.fire({
      icon: "warning",
      title: "Sesión no iniciada",
      text: "⚠️ No hay usuario en sesión.",
      background: "#1e1e1e",
      color: "#fff",
      confirmButtonColor: "#d33"
    }).then(() => {
      window.location.href = "login.html";
    });
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
        Swal.fire({
          icon: "success",
          title: "Perfil actualizado",
          text: "✅ Los cambios se guardaron correctamente.",
          background: "#1e1e1e",
          color: "#fff",
          confirmButtonColor: "#205e5b"
        }).then(() => {
          localStorage.setItem("usuario", JSON.stringify(res));
          location.reload();
        });
      })
      .catch(err => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "❌ " + err.message,
          background: "#1e1e1e",
          color: "#fff",
          confirmButtonColor: "#d33"
        });
      });
  });

  // Mostrar mensaje flotante cuando se intenta cambiar el correo
  function mostrarMensajeCorreo(mensaje) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      background: "#333",
      color: "#fff",
      icon: "info",
      title: mensaje
    });
  }
});
