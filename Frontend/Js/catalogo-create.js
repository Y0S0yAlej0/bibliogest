document.addEventListener("DOMContentLoaded", function () {
  const formLibro = document.getElementById("form-libro");
  const mensajeDiv = document.getElementById("mensaje");

  function mostrarMensaje(texto, tipo = "exito") {
    if (!mensajeDiv) return;
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

  if (formLibro) {
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
        mostrarMensaje("Libro agregado correctamente ✅");
      } catch (error) {
        console.error(error);
        mostrarMensaje("Error al guardar el libro ❌", "error");
      }
    });
  }
});
