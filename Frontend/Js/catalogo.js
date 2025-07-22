document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modal-agregar-libro");
  const btnAbrirModal = document.getElementById("btn-agregar-libro");
  const btnCerrarModal = document.querySelector(".cerrar-modal");
  const formNuevoLibro = document.getElementById("form-nuevo-libro");

  // Mostrar modal
  if (btnAbrirModal && modal) {
    btnAbrirModal.addEventListener("click", () => {
      modal.style.display = "block";
    });
  }

  // Cerrar modal
  if (btnCerrarModal && modal) {
    btnCerrarModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Cerrar modal si se hace clic fuera del contenido
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Enviar formulario del modal
  if (formNuevoLibro) {
    formNuevoLibro.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nuevoLibro = {
        titulo: formNuevoLibro.titulo.value,
        autor: formNuevoLibro.autor.value,
        descripcion: formNuevoLibro.descripcion.value,
        genero: formNuevoLibro.genero.value,
        isbn: formNuevoLibro.isbn.value,
        imagen: formNuevoLibro.imagen.value,
      };

      try {
        const response = await fetch("http://localhost:8080/api/libros", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoLibro),
        });

        if (!response.ok) throw new Error("No se pudo agregar el libro");

        Swal.fire("📚 ¡Libro agregado!", "Se añadió correctamente a la base de datos.", "success");

        formNuevoLibro.reset();
        modal.style.display = "none";

        if (typeof cargarLibros === "function") {
          cargarLibros();
        }
      } catch (error) {
        console.error(error);
        Swal.fire("❌ Error", error.message, "error");
      }
    });
  }
});
