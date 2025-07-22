document.addEventListener("DOMContentLoaded", function () {
  const contenedorLibros = document.querySelector(".libros");
  const inputBuscar = document.getElementById("buscar-input");
  const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");

  console.log("📦 Iniciando script...");
  if (!contenedorLibros) console.warn("⚠️ No se encontró el contenedor de libros (.libros)");
  if (!inputBuscar) console.warn("⚠️ No se encontró el input de búsqueda (#buscar-input)");
  if (!mensajeSinResultados) console.warn("⚠️ No se encontró el mensaje de sin resultados (#mensaje-sin-resultados)");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rolUsuario = usuario?.rol?.toUpperCase() || "";
  console.log("🧑 Rol del usuario:", rolUsuario);

  async function cargarLibros() {
    if (!contenedorLibros) return;
    try {
      console.log("🔄 Cargando libros desde la API...");
      const response = await fetch("http://localhost:8080/api/libros");
      const libros = await response.json();
      console.log("📚 Libros recibidos:", libros.length);
      contenedorLibros.innerHTML = "";

      libros.forEach(libro => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <img src="${libro.imagen || libro.imagenUrl || 'ruta/por_defecto.jpg'}" alt="Portada de ${libro.titulo}">
          <div class="info">
            <h3>${libro.titulo}</h3>
            <p><strong>Autor:</strong> ${libro.autor}</p>
            <p><strong>Género:</strong> ${libro.genero}</p>
            <p><strong>ISBN:</strong> ${libro.isbn}</p>
            <p>${libro.descripcion}</p>
            ${
              rolUsuario === "ADMIN"
                ? `<div class="acciones">
                     <button class="boton-editar" data-id="${libro.id}">✏️ Editar</button>
                     <button class="boton-eliminar" data-id="${libro.id}">🗑️ Eliminar</button>
                   </div>`
                : ""
            }
          </div>
        `;
        contenedorLibros.appendChild(card);
      });

      if (rolUsuario === "ADMIN") {
        console.log("🛠️ Usuario es admin. Agregando eventos...");
        agregarEventos();
      }

      if (mensajeSinResultados) {
        mensajeSinResultados.classList.remove("mostrar");
      }

    } catch (error) {
      console.error("❌ Error al cargar libros:", error);
    }
  }

  function agregarEventos() {
    const botonesEliminar = document.querySelectorAll(".boton-eliminar");
    const botonesEditar = document.querySelectorAll(".boton-editar");

    botonesEliminar.forEach(boton => {
      boton.addEventListener("click", async function () {
        const id = this.getAttribute("data-id");
        console.log("🗑️ Clic en eliminar libro con ID:", id);

        const confirmacion = await Swal.fire({
          title: "¿Estás seguro?",
          text: "Esta acción eliminará el libro.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        });

        if (confirmacion.isConfirmed) {
          try {
            const response = await fetch(`http://localhost:8080/api/libros/${id}`, {
              method: "DELETE"
            });

            if (!response.ok) throw new Error("Error al eliminar el libro");

            Swal.fire("Eliminado", "El libro fue eliminado.", "success");
            cargarLibros();
          } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo eliminar el libro.", "error");
          }
        }
      });
    });

    botonesEditar.forEach(boton => {
      boton.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        const libroCard = boton.closest(".card");
        const titulo = libroCard.querySelector("h3").textContent;
        const autor = libroCard.querySelector("p:nth-child(2)").textContent.replace("Autor:", "").trim();
        const genero = libroCard.querySelector("p:nth-child(3)").textContent.replace("Género:", "").trim();
        const isbn = libroCard.querySelector("p:nth-child(4)").textContent.replace("ISBN:", "").trim();
        const descripcion = libroCard.querySelector("p:nth-child(5)").textContent.trim();
        const imagen = libroCard.querySelector("img").getAttribute("src");

        console.log("✏️ Clic en editar libro:", id, titulo);

        Swal.fire({
          title: "Editar Libro",
          html: `
            <input id="swal-titulo" class="swal2-input" placeholder="Título" value="${titulo}">
            <input id="swal-autor" class="swal2-input" placeholder="Autor" value="${autor}">
            <input id="swal-genero" class="swal2-input" placeholder="Género" value="${genero}">
            <input id="swal-isbn" class="swal2-input" placeholder="ISBN" value="${isbn}">
            <input id="swal-imagen" class="swal2-input" placeholder="URL Imagen" value="${imagen}">
            <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción">${descripcion}</textarea>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Guardar cambios",
          cancelButtonText: "Cancelar",
          preConfirm: () => {
            return {
              titulo: document.getElementById("swal-titulo").value,
              autor: document.getElementById("swal-autor").value,
              genero: document.getElementById("swal-genero").value,
              isbn: document.getElementById("swal-isbn").value,
              imagen: document.getElementById("swal-imagen").value,
              descripcion: document.getElementById("swal-descripcion").value
            };
          }
        }).then(async (resultado) => {
          if (resultado.isConfirmed) {
            const datosActualizados = resultado.value;
            try {
              const response = await fetch(`http://localhost:8080/api/libros/${id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(datosActualizados)
              });

              if (!response.ok) throw new Error("Error al actualizar el libro");

              Swal.fire("Actualizado", "El libro fue actualizado exitosamente.", "success");
              cargarLibros();
            } catch (error) {
              console.error(error);
              Swal.fire("Error", "No se pudo actualizar el libro.", "error");
            }
          }
        });
      });
    });
  }

  // 🔍 BÚSQUEDA con logs de depuración
  if (inputBuscar) {
    inputBuscar.addEventListener("input", function () {
      const filtro = inputBuscar.value.toLowerCase();
      const tarjetas = contenedorLibros.querySelectorAll(".card");
      let coincidencias = 0;

      console.log("🔍 Texto buscado:", filtro);
      console.log("📦 Total de libros cargados:", tarjetas.length);

      tarjetas.forEach(card => {
        const titulo = card.querySelector("h3").textContent.toLowerCase();
        const autorTexto = card.querySelector("p")?.textContent.toLowerCase() || "";
        const coincide = titulo.includes(filtro) || autorTexto.includes(filtro);
        card.style.display = coincide ? "block" : "none";
        if (coincide) coincidencias++;
      });

      console.log("✅ Coincidencias encontradas:", coincidencias);

      if (mensajeSinResultados) {
        if (coincidencias === 0) {
          mensajeSinResultados.classList.add("mostrar");
          console.log("🚨 Mostrando mensaje de sin resultados");
        } else {
          mensajeSinResultados.classList.remove("mostrar");
          console.log("✅ Ocultando mensaje de sin resultados");
        }
      } else {
        console.warn("⚠️ No se encontró el elemento con id 'mensaje-sin-resultados'");
      }
    });
  }

  cargarLibros();
});
