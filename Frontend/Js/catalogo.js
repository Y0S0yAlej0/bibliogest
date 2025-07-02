document.addEventListener("DOMContentLoaded", function () {
  const formLibro = document.getElementById("form-libro");
  const contenedorLibros = document.querySelector(".libros");
  const mensajeDiv = document.getElementById("mensaje");
  const inputBuscar = document.getElementById("buscar-input");

  function mostrarMensaje(texto, tipo = "exito") {
    mensajeDiv.innerHTML = `<div style="
      padding: 0.8em;
      border-radius: 5px;
      background-color: ${tipo === "exito" ? "#d4edda" : "#f8d7da"};
      color: ${tipo === "exito" ? "#155724" : "#721c24"};
      border: 1px solid ${tipo === "exito" ? "#c3e6cb" : "#f5c6cb"};
      margin-top: 1em;
    ">${texto}</div>`;

    setTimeout(() => {
      mensajeDiv.innerHTML = "";
    }, 4000);
  }

  async function cargarLibros() {
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
      mostrarMensaje("Error al cargar libros", "error");
    }
  }

  formLibro.addEventListener("submit", async function (e) {
    e.preventDefault();

    const datos = new FormData(formLibro);
    const nuevoLibro = {
      titulo: datos.get("titulo"),
      autor: datos.get("autor"),
      descripcion: datos.get("descripcion"),
      genero: datos.get("genero"),
      isbn: datos.get("isbn"),
      imagen: datos.get("imagen")
    };

    try {
      const response = await fetch("http://localhost:8080/api/libros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoLibro),
      });

      if (!response.ok) throw new Error("Error al guardar el libro");

      formLibro.reset();
      await cargarLibros();
      mostrarMensaje("Libro agregado correctamente ✅");
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al guardar el libro ❌", "error");
    }
  });

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

  cargarLibros();
});
