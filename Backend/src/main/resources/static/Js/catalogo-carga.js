let librosData = [];
let categoriaActual = 'todas';
let categorias = [];

document.addEventListener("DOMContentLoaded", function () {
  window.librosData = [];

  const contenedorLibros = document.querySelector(".libros");
  const inputBuscar = document.getElementById("buscar-input");
  const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");
  const categoriasLista = document.getElementById("categorias-lista");
  const filtroActivo = document.getElementById("filtro-activo");
  const filtroTexto = document.getElementById("filtro-texto");
  const btnLimpiarFiltro = document.getElementById("btn-limpiar-filtro");
  const btnToggleCategorias = document.getElementById("btn-toggle-categorias");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const usuarioId = usuario ? usuario.id : null;

  // === TOGGLE CATEGORÍAS EN MÓVIL === //
  if (btnToggleCategorias) {
    btnToggleCategorias.addEventListener('click', function() {
      categoriasLista.classList.toggle('visible');
    });
  }

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

    categorias.forEach(categoria => {
      const item = document.createElement('button');
      item.className = 'categoria-item';
      item.dataset.categoria = categoria;
      
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

    // Cerrar el menú en móvil después de seleccionar
    if (window.innerWidth <= 768) {
      categoriasLista.classList.remove('visible');
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
        icon: 'error',
        confirmButtonText: 'Cerrar'
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
          <img src="${libro.imagen || 'https://via.placeholder.com/220x320?text=Sin+Portada'}" 
               alt="Portada de ${libro.titulo}"
               onerror="this.src='https://via.placeholder.com/220x320?text=Sin+Portada'">
          <div class="info">
            <h3>${libro.titulo}</h3>
            <p><strong>Autor:</strong> ${libro.autor}</p>
            <p class="estado-libro ${estadoClase}">${estadoTexto}</p>
          </div>
        </div>
        <div class="card-acciones">
          <button class="boton-reservar" data-id="${libro.id}" ${!disponible ? 'disabled' : ''}>
            ${disponible ? '📚 Reservar' : '❌ Agotado'}
          </button>
        </div>
      `;

      // Click en la tarjeta para ver detalles
      const cardClickeable = card.querySelector('.card-clickeable');
      cardClickeable.addEventListener("click", () => {
        Swal.fire({
          title: libro.titulo,
          html: `
            <div class="modal-libro">
              <img src="${libro.imagen || 'https://via.placeholder.com/240x340?text=Sin+Portada'}" 
                   alt="Portada de ${libro.titulo}" 
                   class="modal-portada"
                   onerror="this.src='https://via.placeholder.com/240x340?text=Sin+Portada'">
              <div class="modal-info">
                <p><strong>📖 Título:</strong> ${libro.titulo}</p>
                <p><strong>✍️ Autor:</strong> ${libro.autor}</p>
                <p><strong>📚 Categoría:</strong> ${libro.categoria || libro.genero || 'N/A'}</p>
                ${libro.registro ? `<p><strong>🔖 Registro:</strong> ${libro.registro}</p>` : ''}
                ${libro.signaturaTopografica ? `<p><strong>📍 Signatura:</strong> ${libro.signaturaTopografica}</p>` : ''}
                ${libro.paginas ? `<p><strong>📄 Páginas:</strong> ${libro.paginas}</p>` : ''}
                <p><strong>📊 Estado:</strong> <span class="estado-libro ${estadoClase}">${estadoTexto}</span></p>
                ${libro.sinopsis || libro.descripcion ? `
                  <div class="modal-descripcion">
                    <strong>📝 Sinopsis:</strong><br>
                    ${libro.sinopsis || libro.descripcion}
                  </div>
                ` : ''}
              </div>
            </div>
          `,
          showCloseButton: true,
          confirmButtonText: "Cerrar",
          width: "700px"
        });
      });

      contenedorLibros.appendChild(card);
    });

    // Agregar eventos a botones de reservar
    agregarEventosReservar();
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
          libro.autor.toLowerCase().includes(filtro) ||
          (libro.genero || '').toLowerCase().includes(filtro) ||
          (libro.categoria || '').toLowerCase().includes(filtro)
        );
      }
      
      renderizarLibros(librosFiltrados);
    });
  }

  // === EVENTO SUBMIT DEL FORMULARIO === //
  const formBusqueda = document.getElementById('form-busqueda');
  if (formBusqueda) {
    formBusqueda.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  // === EVENTOS DE RESERVAR === //
  function agregarEventosReservar() {
    const botonesReservar = document.querySelectorAll(".boton-reservar");

    botonesReservar.forEach(boton => {
      boton.addEventListener("click", async function (e) {
        e.stopPropagation(); // Evitar que se dispare el click de la tarjeta
        
        if (this.disabled) {
          Swal.fire({
            title: "❌ Libro agotado",
            text: "Este libro no está disponible actualmente",
            icon: "error",
            confirmButtonText: "Entendido"
          });
          return;
        }

        const libroId = parseInt(this.getAttribute("data-id"));

        if (!usuario || !usuario.id) {
          Swal.fire({
            title: "⚠️ Inicia sesión",
            text: "Debes iniciar sesión para reservar libros",
            icon: "warning",
            confirmButtonText: "Entendido"
          });
          return;
        }

        // Confirmar reserva
        const confirmar = await Swal.fire({
          title: "📚 Confirmar Reserva",
          text: "¿Deseas reservar este libro?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, reservar",
          cancelButtonText: "Cancelar"
        });

        if (!confirmar.isConfirmed) return;

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
            Swal.fire({
              title: "✅ Reserva creada",
              text: "Tu reserva está pendiente de aprobación por el administrador",
              icon: "success",
              confirmButtonText: "Entendido"
            });
            cargarLibros(); // Recargar libros para actualizar disponibilidad
          } else {
            const mensaje = await response.text();
            Swal.fire({
              title: "⚠️ Aviso",
              text: mensaje,
              icon: "warning",
              confirmButtonText: "Entendido"
            });
          }
        } catch (error) {
          console.error("Error al crear reserva:", error);
          Swal.fire({
            title: "❌ Error",
            text: "Hubo un problema al procesar la reserva",
            icon: "error",
            confirmButtonText: "Cerrar"
          });
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