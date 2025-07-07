document.addEventListener("DOMContentLoaded", function () {
  const contenedorLibros = document.querySelector(".libros");
  const inputBuscar = document.getElementById("buscar-input");

  async function cargarLibros() {
    if (!contenedorLibros) return;
    try {
      const response = await fetch("http://localhost:8080/api/libros");
      const libros = await response.json();
      contenedorLibros.innerHTML = "";

      libros.forEach(libro => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <img src="${libro.imagen}" alt="Portada de ${libro.titulo}">
          <div class="info">
            <h3>${libro.titulo}</h3>
            <p><strong>Autor:</strong> ${libro.autor}</p>
            <p><strong>Género:</strong> ${libro.genero}</p>
            <p><strong>ISBN:</strong> ${libro.isbn}</p>
            <p>${libro.descripcion}</p>
          </div>
        `;
        contenedorLibros.appendChild(card);
      });
    } catch (error) {
      console.error("❌ Error al cargar libros:", error);
    }
  }

  if (inputBuscar) {
    inputBuscar.addEventListener("input", function () {
      const filtro = inputBuscar.value.toLowerCase();
      const tarjetas = contenedorLibros.querySelectorAll(".card");

      tarjetas.forEach(card => {
        const titulo = card.querySelector("h3").textContent.toLowerCase();
        const autorTexto = card.querySelector("p")?.textContent.toLowerCase() || "";
        const coincide = titulo.includes(filtro) || autorTexto.includes(filtro);
        card.style.display = coincide ? "block" : "none";
      });
    });
  }

  cargarLibros();
});
