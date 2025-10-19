let librosData = [];
let categoriaActual = 'todas';
let categorias = [];

document.addEventListener("DOMContentLoaded", function () {
  window.librosData = [];

  const contenedorLibros = document.querySelector(".libros");
  const inputBuscar = document.getElementById("buscar-input");
  const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");
  const btnAgregar = document.getElementById("btn-agregar-libro");
  const categoriasLista = document.getElementById("categorias-lista");
  const filtroActivo = document.getElementById("filtro-activo");
  const filtroTexto = document.getElementById("filtro-texto");
  const btnLimpiarFiltro = document.getElementById("btn-limpiar-filtro");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rolUsuario = usuario?.rol?.toUpperCase() || "";
  const usuarioId = usuario ? usuario.id : null;

  // === CARGAR CATEGORÍAS DESDE EL BACKEND === //
  async function cargarCategorias() {
    try {
      const response = await fetch("http://localhost:8080/api/libros/categorias");
      if (!response.ok) throw new Error("Error al cargar categorías");
      
      const data = await response.json();
      categorias = data.categorias;
      
      console.log("📂 Categorías cargadas:", categorias);
      renderizarCategorias();
      
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
      Swal.fire("❌ Error", "No se pudieron cargar las categorías", "error");
    }
  }

  // === RENDERIZAR LISTA DE CATEGORÍAS === //
  function renderizarCategorias() {
    if (!categoriasLista) return;

    const botonTodas = categoriasLista.querySelector('[data-categoria="todas"]');
    categoriasLista.innerHTML = '';
    
    if (botonTodas) {
      categoriasLista.appendChild(botonTodas);
    }

    categorias.forEach(categoria => {
      const item = document.createElement('button');
      item.className = 'categoria-item';
      item.dataset.categoria = categoria;
      
      const iconos = {
        'Semilla': 'fa-seedling',
        'Semilla 2': 'fa-leaf',
        'Referencia': 'fa-bookmark',
        'Obras Generales': 'fa-books',
        'Filosofía': 'fa-brain',
        'Sociales': 'fa-users',
        'Religión': 'fa-praying-hands',
        'Lenguaje': 'fa-language',
        'Ciencias Puras': 'fa-flask',
        'Artes y Recreación': 'fa-palette',
        'Literatura': 'fa-book-open',
        'Historia': 'fa-landmark',
        'Revistas': 'fa-newspaper',
        'Descarte': 'fa-trash-alt'
      };
      
      const icono = iconos[categoria] || 'fa-book';
      
      item.innerHTML = `
        <i class="fas ${icono}"></i>
        <span>${categoria}</span>
        <span class="contador-categoria" id="contador-${categoria.replace(/\s+/g, '-')}">0</span>
      `;
      
      item.addEventListener('click', () => filtrarPorCategoria(categoria));
      categoriasLista.appendChild(item);
    });

    actualizarContadores();
  }

  // === ACTUALIZAR CONTADORES === //
  function actualizarContadores() {
    const contadorTodas = document.getElementById('contador-todas');
    if (contadorTodas) {
      contadorTodas.textContent = librosData.length;
    }

    categorias.forEach(categoria => {
      const contador = document.getElementById(`contador-${categoria.replace(/\s+/g, '-')}`);
      if (contador) {
        const cantidad = librosData.filter(libro => 
          libro.genero === categoria || libro.categoria === categoria
        ).length;
        contador.textContent = cantidad;
      }
    });
  }

  // === FILTRAR POR CATEGORÍA === //
  async function filtrarPorCategoria(categoria) {
    console.log(`🔍 Filtrando por categoría: ${categoria}`);
    categoriaActual = categoria;
    
    document.querySelectorAll('.categoria-item').forEach(btn => {
      btn.classList.remove('activa');
    });
    
    const btnActivo = document.querySelector(`[data-categoria="${categoria}"]`);
    if (btnActivo) {
      btnActivo.classList.add('activa');
    }

    if (categoria === 'todas') {
      if (filtroActivo) filtroActivo.style.display = 'none';
      renderizarLibros(librosData);
    } else {
      if (filtroActivo) filtroActivo.style.display = 'flex';
      if (filtroTexto) filtroTexto.textContent = `📚 Mostrando: ${categoria}`;
      
      const librosFiltrados = librosData.filter(libro => 
        libro.genero === categoria || libro.categoria === categoria
      );
      
      renderizarLibros(librosFiltrados);
    }
  }

  // === LIMPIAR FILTRO === //
  if (btnLimpiarFiltro) {
    btnLimpiarFiltro.addEventListener('click', () => {
      filtrarPorCategoria('todas');
    });
  }

  // === CARGAR LIBROS === //
  async function cargarLibros() {
    if (!contenedorLibros) return;
    
    try {
      const response = await fetch("http://localhost:8080/api/libros", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      window.librosData = await response.json();
      librosData = window.librosData;
      
      console.log(`✅ ${librosData.length} libros cargados`);
      
      actualizarContadores();
      
      if (categoriaActual === 'todas') {
        renderizarLibros(librosData);
      } else {
        filtrarPorCategoria(categoriaActual);
      }

    } catch (error) {
      console.error("Error al cargar libros:", error);
      Swal.fire({
        title: '❌ Error de conexión',
        text: 'No se pudieron cargar los libros',
        icon: 'error'
      });
    }
  }

  // === RENDERIZAR LIBROS === //
  function renderizarLibros(libros) {
    contenedorLibros.innerHTML = "";

    if (libros.length === 0) {
      mensajeSinResultados?.classList.add("mostrar");
      return;
    }

    mensajeSinResultados?.classList.remove("mostrar");

    libros.forEach(libro => {
      const card = document.createElement("div");
      card.classList.add("card");

      const disponible = libro.cantidad > 0;
      const estadoTexto = disponible ? `Disponibles: ${libro.cantidad}` : "Agotado";
      const estadoClase = disponible ? "disponible" : "agotado";

      card.innerHTML = `
        <div class="card-clickeable" data-id="${libro.id}">
          <img src="${libro.imagen || 'ruta/por_defecto.jpg'}" alt="Portada de ${libro.titulo}">
          <div class="info">
            <h3>${libro.titulo}</h3>
            <p class="estado-libro ${estadoClase}"><strong>${estadoTexto}</strong></p>
          </div>
        </div>
        <div class="card-acciones">
          <button class="boton-reservar" data-id="${libro.id}" ${!disponible ? 'disabled' : ''}>
            📚 ${disponible ? 'Reservar' : 'Agotado'}
          </button>
          ${rolUsuario === "ADMIN" ? `
            <div class="acciones-admin">
              <button class="boton-editar" data-id="${libro.id}">✏️</button>
              <button class="boton-eliminar" data-id="${libro.id}">🗑️</button>
            </div>
          ` : ''}
        </div>
      `;

      // Click en la tarjeta para ver detalles
      const cardClickeable = card.querySelector('.card-clickeable');
      cardClickeable.addEventListener("click", () => {
        Swal.fire({
          title: libro.titulo,
          html: `
            <div class="modal-libro">
              <img src="${libro.imagen || 'ruta/por_defecto.jpg'}" 
                   alt="Portada de ${libro.titulo}" 
                   class="modal-portada">
              <div class="modal-info">
                <p><strong>Autor:</strong> ${libro.autor}</p>
                <p><strong>Categoría:</strong> ${libro.categoria || libro.genero || 'N/A'}</p>
                <p><strong>Registro:</strong> ${libro.registro || 'N/A'}</p>
                ${libro.signaturaTopografica ? `<p><strong>Signatura:</strong> ${libro.signaturaTopografica}</p>` : ''}
                ${libro.paginas ? `<p><strong>Páginas:</strong> ${libro.paginas}</p>` : ''}
                <p class="estado-libro ${estadoClase}"><strong>${estadoTexto}</strong></p>
                <p class="modal-descripcion"><strong>Sinopsis:</strong><br>${libro.sinopsis || libro.descripcion || 'Sin descripción disponible'}</p>
              </div>
            </div>
          `,
          showCloseButton: true,
          confirmButtonText: "Cerrar",
          width: "650px",
          background: "#1e1e1e",
          color: "#f5f5f5"
        });
      });

      contenedorLibros.appendChild(card);
    });

    agregarEventos();
  }
  // === BÚSQUEDA === //
  if (inputBuscar) {
    inputBuscar.addEventListener("input", function () {
      const filtro = inputBuscar.value.toLowerCase();
      
      let librosFiltrados = librosData;
      
      if (categoriaActual !== 'todas') {
        librosFiltrados = librosData.filter(libro => 
          libro.genero === categoriaActual || libro.categoria === categoriaActual
        );
      }
      
      if (filtro) {
        librosFiltrados = librosFiltrados.filter(libro => 
          libro.titulo.toLowerCase().includes(filtro) ||
          libro.autor.toLowerCase().includes(filtro)
        );
      }
      
      renderizarLibros(librosFiltrados);
    });
  }

  // === MODAL AGREGAR LIBRO === //
  if (btnAgregar) {
    btnAgregar.addEventListener("click", async () => {
      const opcionesCategorias = categorias.map(cat => 
        `<option value="${cat}">${cat}</option>`
      ).join('');

      const { value: formValues } = await Swal.fire({
        title: "📚 Agregar Nuevo Libro",
        html: `
          <div class="form-container">
            <div class="form-section">
              <h3 class="section-title">📖 Información Principal</h3>
              <div class="form-grid">
                <div class="form-field">
                  <label><i class="fas fa-book"></i> Título *</label>
                  <input id="swal-input-titulo" class="form-input required" placeholder="Ej: Cien años de soledad">
                </div>
                <div class="form-field">
                  <label><i class="fas fa-user-edit"></i> Autor *</label>
                  <input id="swal-input-autor" class="form-input required" placeholder="Ej: Gabriel García Márquez">
                </div>
                <div class="form-field">
                  <label><i class="fas fa-tag"></i> Categoría *</label>
                  <select id="swal-input-categoria" class="form-select required">
                    <option value="">📚 Selecciona una categoría...</option>
                    ${opcionesCategorias}
                  </select>
                </div>
                <div class="form-field">
                  <label><i class="fas fa-barcode"></i> Registro</label>
                  <input id="swal-input-registro" class="form-input" placeholder="Ej: REG-2024-001">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">📊 Detalles Técnicos</h3>
              <div class="form-grid">
                <div class="form-field">
                  <label><i class="fas fa-map-marker-alt"></i> Signatura Topográfica</label>
                  <input id="swal-input-signatura" class="form-input" placeholder="Ej: 863.6 G216c">
                </div>
                <div class="form-field">
                  <label><i class="fas fa-cubes"></i> Cantidad Disponible *</label>
                  <input id="swal-input-cantidad" class="form-input required" type="number" value="1" min="1">
                </div>
                <div class="form-field">
                  <label><i class="fas fa-file-alt"></i> Páginas</label>
                  <input id="swal-input-paginas" class="form-input" type="number" placeholder="417" min="1">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">🖼️ Multimedia y Descripción</h3>
              <div class="form-field">
                <label><i class="fas fa-image"></i> URL de la Imagen</label>
                <input id="swal-input-imagen" class="form-input" placeholder="https://ejemplo.com/portada.jpg">
                <span class="form-field-hint">Ingresa la URL completa de la portada del libro</span>
              </div>
              <div class="form-field">
                <label><i class="fas fa-align-left"></i> Sinopsis</label>
                <textarea id="swal-input-sinopsis" class="form-textarea" placeholder="Escribe una breve descripción del libro..."></textarea>
                <span class="form-field-hint">Máximo 500 caracteres recomendados</span>
              </div>
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "💾 Guardar Libro",
        cancelButtonText: "❌ Cancelar",
        width: "950px",
        background: "#1A1A1A",
        color: "#F0EDE5",
        customClass: {
          popup: 'swal-dark-modern',
          title: 'swal-dark-title',
          confirmButton: 'swal-confirm-modern',
          cancelButton: 'swal-cancel-modern'
        },
        preConfirm: () => {
          const titulo = document.getElementById("swal-input-titulo").value.trim();
          const autor = document.getElementById("swal-input-autor").value.trim();
          const categoria = document.getElementById("swal-input-categoria").value.trim();

          if (!titulo || !autor || !categoria) {
            Swal.showValidationMessage('⚠️ Título, Autor y Categoría son obligatorios');
            return false;
          }

          return {
            titulo,
            autor,
            genero: categoria,
            registro: document.getElementById("swal-input-registro").value.trim() || null,
            signaturaTopografica: document.getElementById("swal-input-signatura").value.trim() || null,
            paginas: parseInt(document.getElementById("swal-input-paginas").value) || null,
            imagen: document.getElementById("swal-input-imagen").value.trim() || null,
            cantidad: parseInt(document.getElementById("swal-input-cantidad").value) || 1,
            sinopsis: document.getElementById("swal-input-sinopsis").value.trim() || null,
            estado: "disponible"
          };
        },
      });

      if (formValues) {
        try {
          const response = await fetch("http://localhost:8080/api/libros", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(formValues),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          Swal.fire("✅ Libro agregado", "", "success");
          cargarLibros();
        } catch (error) {
          console.error("❌ Error:", error);
          Swal.fire("❌ Error", error.message, "error");
        }
      }
    });
  }

  // === EVENTOS (EDITAR, ELIMINAR, RESERVAR) === //
  function agregarEventos() {
    const botonesEliminar = document.querySelectorAll(".boton-eliminar");
    const botonesEditar = document.querySelectorAll(".boton-editar");
    const botonesReservar = document.querySelectorAll(".boton-reservar");

    // RESERVAR
    botonesReservar.forEach(boton => {
      boton.addEventListener("click", async function () {
        if (this.disabled) {
          Swal.fire("❌ Libro agotado", "No disponible", "error");
          return;
        }

        const libroId = parseInt(this.getAttribute("data-id"));

        if (!usuario || !usuario.id) {
          Swal.fire("⚠️ Debes iniciar sesión", "", "warning");
          return;
        }

        try {
          const response = await fetch("http://localhost:8080/api/reservas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              libroId: libroId,
              usuarioId: usuario.id
            })
          });

          if (response.ok) {
            Swal.fire("✅ Reserva creada", "Pendiente de aprobación", "success");
            cargarLibros();
          } else {
            const mensaje = await response.text();
            Swal.fire("⚠️ Aviso", mensaje, "warning");
          }
        } catch (error) {
          Swal.fire("❌ Error", "Problema de conexión", "error");
        }
      });
    });

    // ELIMINAR
    botonesEliminar.forEach(boton => {
      boton.addEventListener("click", async function () {
        const id = this.getAttribute("data-id");
        
        const confirmacion = await Swal.fire({
          title: "⚠️ ¿Estás seguro?",
          html: "<p>Se eliminarán el libro y sus reservas</p>",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#dc3545",
          confirmButtonText: "🗑️ Sí, eliminar",
          cancelButtonText: "❌ Cancelar"
        });

        if (confirmacion.isConfirmed) {
          try {
            const response = await fetch(`http://localhost:8080/api/libros/${id}`, {
              method: "DELETE"
            });

            if (response.ok) {
              Swal.fire("✅ Eliminado", "", "success");
              cargarLibros();
            } else {
              Swal.fire("❌ Error", "No se pudo eliminar", "error");
            }
          } catch (error) {
            Swal.fire("❌ Error", "Problema de conexión", "error");
          }
        }
      });
    });

    // EDITAR
    botonesEditar.forEach(boton => {
      boton.addEventListener("click", async function () {
        const id = this.getAttribute("data-id");

        try {
          const response = await fetch(`http://localhost:8080/api/libros/${id}`);
          if (!response.ok) throw new Error("No se pudo cargar el libro");

          const libro = await response.json();
          const opcionesCategorias = categorias.map(cat => 
            `<option value="${cat}" ${(libro.genero === cat || libro.categoria === cat) ? 'selected' : ''}>${cat}</option>`
          ).join('');

          const resultado = await Swal.fire({
            title: "✏️ Editar Libro",
            html: `
              <div class="form-container">
                <div class="form-section">
                  <div class="form-grid">
                    <div class="form-field">
                      <label>Título *</label>
                      <input id="swal-titulo" class="form-input" value="${libro.titulo || ''}">
                    </div>
                    <div class="form-field">
                      <label>Autor *</label>
                      <input id="swal-autor" class="form-input" value="${libro.autor || ''}">
                    </div>
                    <div class="form-field">
                      <label>Categoría *</label>
                      <select id="swal-categoria" class="form-input">
                        ${opcionesCategorias}
                      </select>
                    </div>
                    <div class="form-field">
                      <label>Cantidad</label>
                      <input id="swal-cantidad" class="form-input" type="number" value="${libro.cantidad || 1}">
                    </div>
                  </div>
                </div>
                <div class="form-section">
                  <div class="form-field">
                    <label>Imagen</label>
                    <input id="swal-imagen" class="form-input" value="${libro.imagen || ''}">
                  </div>
                  <div class="form-field">
                    <label>Sinopsis</label>
                    <textarea id="swal-sinopsis" class="form-textarea">${libro.sinopsis || ''}</textarea>
                  </div>
                </div>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: "💾 Guardar",
            cancelButtonText: "❌ Cancelar",
            width: "800px",
            background: "#1a1a2e",
            color: "#e4e6ea",
            preConfirm: () => ({
              titulo: document.getElementById("swal-titulo").value.trim(),
              autor: document.getElementById("swal-autor").value.trim(),
              genero: document.getElementById("swal-categoria").value.trim(),
              cantidad: parseInt(document.getElementById("swal-cantidad").value) || 1,
              imagen: document.getElementById("swal-imagen").value.trim() || null,
              sinopsis: document.getElementById("swal-sinopsis").value.trim() || null
            })
          });

          if (resultado.isConfirmed) {
            const responseUpdate = await fetch(`http://localhost:8080/api/libros/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resultado.value)
            });

            if (responseUpdate.ok) {
              Swal.fire("✅ Actualizado", "", "success");
              cargarLibros();
            } else {
              Swal.fire("❌ Error", "No se pudo actualizar", "error");
            }
          }
        } catch (error) {
          Swal.fire("❌ Error", "No se pudo cargar el libro", "error");
        }
      });
    });
  }

  // === INICIALIZACIÓN === //
  async function inicializar() {
    await cargarCategorias();
    await cargarLibros();
  }

  inicializar();
});