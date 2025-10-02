document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resenaForm");

  // Verifica que hay un usuario logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || !usuario.id) {
    Swal.fire({
      icon: "warning",
      title: "Acceso denegado",
      text: "Debes iniciar sesión para escribir una reseña.",
      background: "#1e1e1e",
      color: "#fff",
      confirmButtonColor: "#3085d6"
    });
    return;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const calificacion = parseInt(document.getElementById("inputRating").value);
      const contenido = document.getElementById("inputReview").value;

      if (!contenido || !calificacion) {
        Swal.fire({
          icon: "error",
          title: "Campos incompletos",
          text: "Por favor, completa todos los campos.",
          background: "#1e1e1e",
          color: "#fff",
          confirmButtonColor: "#d33"
        });
        return;
      }

      fetch(`http://localhost:8080/api/resenas/usuario/${usuario.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calificacion, contenido })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          Swal.fire({
            icon: "success",
            title: "¡Reseña enviada!",
            text: "Gracias por compartir tu opinión.",
            background: "#1e1e1e",
            color: "#fff",
            confirmButtonColor: "#00b894"
          });
          form.reset();
          // Resetear las estrellas visualmente
          document.querySelectorAll('.rating-stars label').forEach(label => {
            label.style.color = 'rgba(202, 165, 79, 0.3)';
            label.style.transform = 'scale(1)';
          });
          cargarResenas(); // recargar reseñas
        })
        .catch(err => {
          console.error("Error al enviar la reseña:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo enviar la reseña. Por favor, intenta de nuevo.",
            background: "#1e1e1e",
            color: "#fff"
          });
        });
    });
  } else {
    console.warn("Formulario no encontrado");
  }

  cargarResenas();
});

function cargarResenas() {
  fetch("http://localhost:8080/api/resenas")
    .then(res => res.json())
    .then(resenas => {
      // Convertir resenas al formato esperado por renderReviews
      const resenasFormateadas = resenas.map(resena => ({
        rating: resena.calificacion,
        texto: resena.contenido,
        fecha: resena.fecha,
        usuario: resena.usuario.nombre
      }));

      renderReviews(resenasFormateadas);
    })
    .catch(err => {
      console.error("Error al cargar reseñas:", err);
      document.getElementById('noReviews').style.display = 'block';
    });
}