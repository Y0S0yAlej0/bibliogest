document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resenaForm");

  // Verifica que hay un usuario logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || !usuario.id) {
    alert("Debes iniciar sesión para escribir una reseña.");
    return;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const calificacion = parseInt(document.getElementById("inputRating").value);
      const contenido = document.getElementById("inputReview").value;

      if (!contenido || !calificacion) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      fetch(`http://localhost:8080/api/resenas/usuario/${usuario.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calificacion, contenido })
      })
        .then(res => res.json())
        .then(data => {
          alert("✅ Reseña enviada");
          form.reset();
          cargarResenas(); // recargar reseñas
        })
        .catch(err => console.error("Error al enviar la reseña:", err));
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
      const container = document.getElementById("resenasContainer");
      if (!container) return;

      container.innerHTML = ""; // limpia reseñas anteriores

      resenas.reverse().forEach(resena => {
        const card = document.createElement("section");
        card.className = "review-card";
        card.innerHTML = `
          <div class="card">
            <div class="card-header">
              ${resena.usuario.nombre} (${resena.usuario.correo}) - <small>${resena.calificacion}/5</small>
            </div>
            <div class="card-body">
              <p>${resena.contenido}</p>
              <footer>${resena.fecha}</footer>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Error al cargar reseñas:", err));
}
