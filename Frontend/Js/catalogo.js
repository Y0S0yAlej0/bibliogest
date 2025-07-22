document.addEventListener("DOMContentLoaded", function () {
  const formLibro = document.getElementById("form-libro");
  const mensaje = document.getElementById("mensaje");
  let modoEditar = false;
  let idLibroEditando = null;

  formLibro.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nuevoLibro = {
      titulo: formLibro.titulo.value,
      autor: formLibro.autor.value,
      descripcion: formLibro.descripcion.value,
      genero: formLibro.genero.value,
      isbn: formLibro.isbn.value,
      imagen: formLibro.imagen.value
    };

    try {
      if (modoEditar) {
        // MODO EDITAR: actualiza libro existente
        const response = await fetch(`http://localhost:8080/api/libros/${idLibroEditando}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoLibro),
        });

        if (!response.ok) throw new Error("No se pudo actualizar el libro");

        mensaje.textContent = "📘 Libro actualizado exitosamente.";
        modoEditar = false;
        idLibroEditando = null;
      } else {
        // MODO CREAR: agrega nuevo libro
        const response = await fetch("http://localhost:8080/api/libros", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoLibro),
        });

        if (!response.ok) throw new Error("No se pudo agregar el libro");

        mensaje.textContent = "📚 Libro agregado exitosamente.";
      }

      formLibro.reset();
      cargarLibros();
    } catch (error) {
      mensaje.textContent = "❌ Error: " + error.message;
    }
  });

  // Función para eliminar un libro
  window.eliminarLibro = async function (id) {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el libro.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:8080/api/libros/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("No se pudo eliminar el libro");

      Swal.fire("Eliminado", "El libro fue eliminado.", "success");
      cargarLibros();
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar el libro.", "error");
    }
  };

  // Función para preparar edición
  window.editarLibro = function (libro) {
    formLibro.titulo.value = libro.titulo;
    formLibro.autor.value = libro.autor;
    formLibro.descripcion.value = libro.descripcion;
    formLibro.genero.value = libro.genero;
    formLibro.isbn.value = libro.isbn;
    formLibro.imagen.value = libro.imagen;

    modoEditar = true;
    idLibroEditando = libro.id;
    mensaje.textContent = "✏️ Editando libro...";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
});
