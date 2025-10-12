
let librosData = [];

document.addEventListener("DOMContentLoaded", function () {


    window.librosData = [];

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

            // IMPORTANTE: Asignar a variable global
            window.librosData = await response.json();
            const librosData = window.librosData;
            
            contenedorLibros.innerHTML = "";

            librosData.forEach(libro => {
                const card = document.createElement("div");
                card.classList.add("card");

                const disponible = libro.cantidad > 0;
                const estadoTexto = disponible ? `Disponibles: ${libro.cantidad}` : "Agotado";
                const estadoClase = disponible ? "disponible" : "agotado";

                // Usar el manager de favoritos
                const yaEsFavorito = window.favoritosManager.esFavorito(libro.id);

                card.innerHTML = `
                    <img src="${libro.imagen || libro.imagenUrl || 'ruta/por_defecto.jpg'}" alt="Portada de ${libro.titulo}">
                    <div class="info">
                        <h3>${libro.titulo}</h3>
                        <p><strong>Autor:</strong> ${libro.autor}</p>
                        <p><strong>Categoría:</strong> ${libro.categoria || libro.genero || 'N/A'}</p>
                        <p><strong>Registro:</strong> ${libro.registro || libro.isbn || 'N/A'}</p>
                        <p class="estado-libro ${estadoClase}"><strong>${estadoTexto}</strong></p>
                        <p>${libro.sinopsis || libro.descripcion || 'Sin descripción'}</p>
                        
                        <div class="acciones-libro">
                            <button class="boton-favorito ${yaEsFavorito ? 'favorito-activo' : ''}" 
                                    data-libro-id="${libro.id}" 
                                    onclick="event.stopPropagation(); window.favoritosManager.toggleFavorito(${libro.id}, ${JSON.stringify(libro).replace(/"/g, '&quot;')})">
                                <i class="${yaEsFavorito ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                            
                            ${rolUsuario === "ADMIN" ? `
                                <div class="acciones-admin">
                                    <button class="boton-editar" data-id="${libro.id}">✏️ Editar</button>
                                    <button class="boton-eliminar" data-id="${libro.id}">🗑️ Eliminar</button>
                                </div>
                            ` : ''}
                            
                            <button class="boton-reservar" data-id="${libro.id}" ${!disponible ? 'disabled' : ''}>
                                📚 ${disponible ? 'Reservar' : 'Agotado'}
                            </button>
                        </div>
                    </div>
                `;

                // Evento click en la tarjeta para modal de detalles
                card.addEventListener("click", (e) => {
                    const selectoresEvitar = [
                        '.acciones-libro',
                        '.boton-editar', 
                        '.boton-eliminar', 
                        '.boton-reservar', 
                        '.boton-favorito',
                        '.acciones-admin',
                        'button'
                    ];
                    
                    const clicEnAccion = selectoresEvitar.some(selector => 
                        e.target.closest(selector)
                    );
                    
                    if (clicEnAccion) return;

                    Swal.fire({
                        title: libro.titulo,
                        html: `
                            <div class="modal-libro">
                                <img src="${libro.imagen || libro.imagenUrl || 'ruta/por_defecto.jpg'}" 
                                     alt="Portada de ${libro.titulo}" 
                                     class="modal-portada">
                                <div class="modal-info">
                                    <p><strong>Autor:</strong> ${libro.autor}</p>
                                    <p><strong>Categoría:</strong> ${libro.categoria || libro.genero || 'N/A'}</p>
                                    <p><strong>Registro:</strong> ${libro.registro || libro.isbn || 'N/A'}</p>
                                    ${libro.signaturaTopografica ? `<p><strong>Signatura:</strong> ${libro.signaturaTopografica}</p>` : ''}
                                    ${libro.paginas ? `<p><strong>Páginas:</strong> ${libro.paginas}</p>` : ''}
                                    ${libro.ejemplar ? `<p><strong>Ejemplar:</strong> ${libro.ejemplar}</p>` : ''}
                                    ${libro.cantidadRegistro ? `<p><strong>Cantidad Registro:</strong> ${libro.cantidadRegistro}</p>` : ''}
                                    <p class="modal-sinopsis"><strong>Sinopsis:</strong> ${ libro.descripcion || 'Sin descripción'}</p>
                                    ${libro.observaciones ? `<p class="modal-observaciones"><strong>Observaciones:</strong> ${libro.observaciones}</p>` : ''}
                                    ${libro.url ? `<p><strong>URL:</strong> <a href="${libro.url}" target="_blank">${libro.url}</a></p>` : ''}
                                </div>
                            </div>
                        `,
                        showCloseButton: true,
                        confirmButtonText: "Cerrar",
                        width: "600px",
                        background: "#1e1e1e",
                        color: "#f5f5f5",
                        customClass: {
                            popup: "swal-dark",
                            title: "swal-dark-title",
                            confirmButton: "swal-dark-btn"
                        }
                    });
                });

                contenedorLibros.appendChild(card);
            });

            // Agregar eventos después de renderizar
            agregarEventos();
            mensajeSinResultados?.classList.remove("mostrar");

        } catch (error) {
            console.error("Error al cargar libros:", error);
            // Tu manejo de errores existente...
        }
    }

    // Escuchar cambios en favoritos
    window.addEventListener('favoritosChanged', function(e) {
        console.log("🔄 Favoritos cambiaron:", e.detail);
        // Actualizar botones de favorito si es necesario
        actualizarBotonesFavoritos();
    });

    function actualizarBotonesFavoritos() {
        const botonesFavorito = document.querySelectorAll('.boton-favorito');
        botonesFavorito.forEach(btn => {
            const libroId = btn.dataset.libroId;
            const esFav = window.favoritosManager.esFavorito(libroId);
            
            if (esFav) {
                btn.classList.add('favorito-activo');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fas fa-heart';
            } else {
                btn.classList.remove('favorito-activo');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'far fa-heart';
            }
        });
    }



  // Recuperar usuario logueado desde localStorage
  const contenedorLibros = document.querySelector(".libros");
  const inputBuscar = document.getElementById("buscar-input");
  const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");
  const btnAgregar = document.getElementById("btn-agregar-libro");
 
  if (!contenedorLibros) console.warn("⚠️ No se encontró el contenedor de libros (.libros)");
  if (!inputBuscar) console.warn("⚠️ No se encontró el input de búsqueda (#buscar-input)");
  if (!mensajeSinResultados) console.warn("⚠️ No se encontró el mensaje de sin resultados (#mensaje-sin-resultados)");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rolUsuario = usuario?.rol?.toUpperCase() || "";
  const usuarioId = usuario ? usuario.id : null;

// === VARIABLES PARA FAVORITOS === //
// === SECCIÓN DE FAVORITOS CORREGIDA PARA catalogo-carga.js === //
// Reemplaza toda la sección de favoritos en tu archivo

// === VARIABLES PARA FAVORITOS === //
let favoritos = [];

// Función para cargar favoritos del usuario
function cargarFavoritos() {
  if (!usuario) return;
  const favoritosGuardados = localStorage.getItem(`favoritos_${usuario.id}`);
  favoritos = favoritosGuardados ? JSON.parse(favoritosGuardados) : [];
  console.log("❤️ Favoritos cargados:", favoritos.length);
}

// Función para verificar si un libro es favorito
function esFavorito(libroId) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return false;
  
  const favoritos = JSON.parse(localStorage.getItem(`favoritos_${usuario.id}`) || '[]');
  return favoritos.some(fav => fav.libroId === libroId);
}

// 🔧 FUNCIÓN GLOBAL PARA TOGGLE FAVORITO (CORREGIDA)
window.toggleFavorito = function(libroId) {
  console.log("🔄 Toggle favorito llamado para libro ID:", libroId);
  
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (!usuario || !usuario.id) {
      Swal.fire({
          title: "⚠️ Necesitas iniciar sesión",
          text: "Para agregar libros a favoritos, debes estar registrado",
          icon: "warning",
          confirmButtonText: "Ir al login",
          showCancelButton: true,
          cancelButtonText: "Cancelar"
      }).then((result) => {
          if (result.isConfirmed) {
              window.location.href = "login.html";
          }
      });
      return;
  }

  const favoritosKey = `favoritos_${usuario.id}`;
  let favoritos = JSON.parse(localStorage.getItem(favoritosKey) || '[]');
  
  const yaEsFavorito = favoritos.some(fav => fav.libroId === libroId);
  const libro = librosData.find(l => l.id === libroId);

  if (!libro) {
      console.error("Libro no encontrado:", libroId);
      return;
  }
  
  if (yaEsFavorito) {
      // Quitar de favoritos
      favoritos = favoritos.filter(fav => fav.libroId !== libroId);
      localStorage.setItem(favoritosKey, JSON.stringify(favoritos));
      
      Swal.fire({
          title: "💔 Quitado de favoritos",
          text: `"${libro.titulo}" fue removido de tus favoritos`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false
      });

      // Actualizar icono
      const btn = document.querySelector(`.boton-favorito[data-libro-id="${libroId}"]`);
      if (btn) {
          btn.classList.remove('favorito-activo');
          btn.querySelector('i').className = 'far fa-heart';
      }
  } else {
      // Agregar a favoritos
      favoritos.push({
          libroId: libroId,
          fechaAgregado: new Date().toISOString()
      });
      localStorage.setItem(favoritosKey, JSON.stringify(favoritos));
      
      Swal.fire({
          title: "❤️ ¡Agregado a favoritos!",
          text: `"${libro.titulo}" se agregó a tu lista`,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Seguir navegando",
          cancelButtonText: "Ver favoritos",
          timer: 3000,
          timerProgressBar: true
      }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
              window.location.href = "mis-favoritos.html";
          }
      });

      // Actualizar icono
      const btn = document.querySelector(`.boton-favorito[data-libro-id="${libroId}"]`);
      if (btn) {
          btn.classList.add('favorito-activo');
          btn.querySelector('i').className = 'fas fa-heart';
      }
  }
};

// 🔧 FUNCIÓN GLOBAL PARA VERIFICAR FAVORITOS
window.esFavorito = function(libroId) {
  return favoritos.some(fav => fav.libroId === libroId);
};

// 🔧 FUNCIÓN GLOBAL PARA OBTENER CONTADOR
window.getContadorFavoritos = function() {
  return favoritos.length;
};
    // 🔄 Modal: abrir/cerrar - FORMULARIO COMPLETO ACTUALIZADO
    if (btnAgregar) {
        btnAgregar.addEventListener("click", async () => {
            const { value: formValues } = await Swal.fire({
                title: "📚 Agregar Nuevo Libro",
                html: `
          <div class="form-container">
            <div class="form-section">
              <h3 class="section-title">📖 Información Principal</h3>
              <div class="form-grid">
                <div class="form-field">
                  <label>Título *</label>
                  <input id="swal-input-titulo" class="form-input required" placeholder="Ingresa el título del libro">
                </div>
                <div class="form-field">
                  <label>Autor *</label>
                  <input id="swal-input-autor" class="form-input required" placeholder="Nombre del autor">
                </div>
                <div class="form-field">
                  <label>Categoría</label>
                  <input id="swal-input-categoria" class="form-input" placeholder="Género o categoría">
                </div>
                <div class="form-field">
                  <label>Registro</label>
                  <input id="swal-input-registro" class="form-input" placeholder="Código de registro">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">📊 Detalles Técnicos</h3>
              <div class="form-grid">
                <div class="form-field">
                  <label>Signatura Topográfica</label>
                  <input id="swal-input-signatura" class="form-input" placeholder="Signatura">
                </div>
                <div class="form-field">
                  <label>Cantidad Registro</label>
                  <input id="swal-input-cantidad-registro" class="form-input" type="number" placeholder="0" min="0">
                </div>
                <div class="form-field">
                  <label>Páginas</label>
                  <input id="swal-input-paginas" class="form-input" type="number" placeholder="0" min="1">
                </div>
                <div class="form-field">
                  <label>Cantidad Disponible</label>
                  <input id="swal-input-cantidad" class="form-input" type="number" placeholder="1" min="1" value="1">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">🖼️ Información Adicional</h3>
              <div class="form-field">
                <label>Ejemplar</label>
                <input id="swal-input-ejemplar" class="form-input" placeholder="Número de ejemplar">
              </div>
              <div class="form-field">
                <label>URL de la Imagen</label>
                <input id="swal-input-imagen" class="form-input" placeholder="https://ejemplo.com/imagen.jpg">
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">📝 Descripción</h3>
              <div class="form-field">
                <label>Sinopsis</label>
                <textarea id="swal-input-sinopsis" class="form-textarea" placeholder="Descripción del libro..."></textarea>
              </div>
              <div class="form-field">
                <label>Observaciones</label>
                <textarea id="swal-input-observaciones" class="form-textarea" placeholder="Notas adicionales..."></textarea>
              </div>
            </div>
          </div>

          <style>
            .form-container {
              max-height: 600px;
              overflow-y: auto;
              padding: 0 5px;
              text-align: left;
            }

            .form-section {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 15px;
              padding: 20px;
              margin-bottom: 20px;
            }

            .section-title {
              color: #4a90e2;
              font-size: 1.2rem;
              margin-bottom: 15px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .form-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
            }

            .form-field {
              display: flex;
              flex-direction: column;
            }

            .form-field label {
              color: #e4e6ea;
              font-size: 0.9rem;
              font-weight: 600;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 5px;
            }

            .form-input, .form-textarea {
              background: rgba(42, 48, 66, 0.8) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 10px !important;
              padding: 12px 15px !important;
              color: #e4e6ea !important;
              font-size: 0.95rem !important;
              transition: all 0.3s ease !important;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            }

            .form-input:focus, .form-textarea:focus {
              border-color: #4a90e2 !important;
              box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2) !important;
              transform: translateY(-1px) !important;
            }

            .form-textarea {
              resize: vertical !important;
              min-height: 80px !important;
              font-family: inherit !important;
            }

            .required {
              border-color: rgba(247, 183, 49, 0.3) !important;
            }

            .form-container::-webkit-scrollbar {
              width: 8px;
            }

            .form-container::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }

            .form-container::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #4a90e2, #357abd);
              border-radius: 10px;
            }
          </style>
        `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "💾 Guardar Libro",
                cancelButtonText: "❌ Cancelar",
                width: "900px",
                background: "#1a1a2e",
                color: "#e4e6ea",
                customClass: {
                    popup: "swal-dark-modern",
                    title: "swal-dark-title",
                    confirmButton: "swal-confirm-modern",
                    cancelButton: "swal-cancel-modern"
                },
                didOpen: () => {
                    // Agregar estilos adicionales para los botones
                    const style = document.createElement('style');
                    style.textContent = `
            .swal-dark-modern {
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 20px !important;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
            }
            
            .swal-confirm-modern {
              background: linear-gradient(135deg, #4a90e2, #357abd) !important;
              border: none !important;
              border-radius: 10px !important;
              padding: 12px 25px !important;
              font-weight: 600 !important;
              transition: all 0.3s ease !important;
            }
            
            .swal-confirm-modern:hover {
              background: linear-gradient(135deg, #357abd, #2868a8) !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 20px rgba(74, 144, 226, 0.3) !important;
            }
            
            .swal-cancel-modern {
              background: rgba(255, 255, 255, 0.1) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 10px !important;
              padding: 12px 25px !important;
              font-weight: 600 !important;
              color: #e4e6ea !important;
            }
            
            .swal-cancel-modern:hover {
              background: rgba(255, 255, 255, 0.2) !important;
            }
          `;
                    document.head.appendChild(style);
                },
                preConfirm: () => {
                    const titulo = document.getElementById("swal-input-titulo").value.trim();
                    const autor = document.getElementById("swal-input-autor").value.trim();

                    if (!titulo || !autor) {
                        Swal.showValidationMessage('⚠️ Título y Autor son campos obligatorios');
                        return false;
                    }

                    return {
                        titulo: titulo,
                        autor: autor,
                        categoria: document.getElementById("swal-input-categoria").value.trim(),
                        registro: document.getElementById("swal-input-registro").value.trim(),
                        signaturaTopografica: document.getElementById("swal-input-signatura").value.trim(),
                        cantidadRegistro: parseInt(document.getElementById("swal-input-cantidad-registro").value) || null,
                        paginas: parseInt(document.getElementById("swal-input-paginas").value) || null,
                        ejemplar: document.getElementById("swal-input-ejemplar").value.trim(),
                        imagen: document.getElementById("swal-input-imagen").value.trim(),
                        cantidad: parseInt(document.getElementById("swal-input-cantidad").value) || 1,
                        sinopsis: document.getElementById("swal-input-sinopsis").value.trim(),
                        observaciones: document.getElementById("swal-input-observaciones").value.trim(),
                        estado: "disponible"
                    };
                },
            });

            // En la función del botón agregar, cambia la parte del fetch por esto:

            if (formValues) {
                try {
                    // 🔧 SOLUCIÓN: Limpiar datos antes de enviar
                    // 🔧 SOLUCIÓN: Limpiar datos antes de enviar
                    const datosLimpios = {
                        titulo: formValues.titulo || "",
                        autor: formValues.autor || "",
                        genero: formValues.categoria || "Sin categoría", // CAMBIO: usar genero y valor por defecto
                        registro: formValues.registro || null,
                        signaturaTopografica: formValues.signaturaTopografica || null,
                        cantidadRegistro: formValues.cantidadRegistro || null,
                        paginas: formValues.paginas || null,
                        ejemplar: formValues.ejemplar || null,
                        imagen: formValues.imagen || null,
                        cantidad: formValues.cantidad || 1,
                        sinopsis: formValues.sinopsis || null,
                        observaciones: formValues.observaciones || null,
                        estado: "disponible"
                    };

                    console.log("📤 Datos que se envían:", datosLimpios); // Para debug

                    const response = await fetch("http://localhost:8080/api/libros", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify(datosLimpios),
                    });

                    if (!response.ok) {
                        // 🔍 Obtener más detalles del error
                        const errorText = await response.text();
                        console.error("❌ Error del servidor:", errorText);
                        throw new Error(`Error ${response.status}: ${errorText}`);
                    }

                    const resultado = await response.json();
                    console.log("✅ Libro creado:", resultado);

                    Swal.fire("✅ Libro agregado", "", "success");
                    cargarLibros();
                } catch (error) {
                    console.error("❌ Error completo:", error);
                    Swal.fire("❌ Error", error.message, "error");
                }
            }
        });
    }




    async function cargarLibros() {
    if (!contenedorLibros) return;
    
    try {
        // Cambiamos el puerto a 8080 que es el que usa tu servidor Spring Boot
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

        librosData = await response.json();
        contenedorLibros.innerHTML = "";

        librosData.forEach(libro => {
          const card = document.createElement("div");
          card.classList.add("card");

          // Determinar si está disponible
          const disponible = libro.cantidad > 0;
          const estadoTexto = disponible ? `Disponibles: ${libro.cantidad}` : "Agotado";
          const estadoClase = disponible ? "disponible" : "agotado";

      // Verificar si es favorito
      const yaEsFavorito = esFavorito(libro.id);

      card.innerHTML = `
        <img src="${libro.imagen || libro.imagenUrl || 'ruta/por_defecto.jpg'}" alt="Portada de ${libro.titulo}">
        <div class="info">
          <h3>${libro.titulo}</h3>
          <p><strong>Autor:</strong> ${libro.autor}</p>
          <p><strong>Categoría:</strong> ${libro.categoria || libro.genero || 'N/A'}</p>
          <p><strong>Registro:</strong> ${libro.registro || libro.isbn || 'N/A'}</p>
          <p class="estado-libro ${estadoClase}"><strong>${estadoTexto}</strong></p>
          <p>${libro.sinopsis || libro.descripcion || 'Sin descripción'}</p>
          
          <div class="acciones-libro">
            <!-- Botón de favorito (siempre visible) -->
            <button class="boton-favorito ${esFavorito(libro.id) ? 'favorito-activo' : ''}" 
                    data-libro-id="${libro.id}" 
                    onclick="event.stopPropagation(); toggleFavorito(${libro.id})">
                <i class="${esFavorito(libro.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
            
            ${
              rolUsuario === "ADMIN"
                ? `<div class="acciones-admin">
                     <button class="boton-editar" data-id="${libro.id}">✏️ Editar</button>
                     <button class="boton-eliminar" data-id="${libro.id}">🗑️ Eliminar</button>
                   </div>`
                : ``
            }
            
            <!-- Botón de reservar -->
            ${disponible ? 
              `<button class="boton-reservar" data-id="${libro.id}">📚 Reservar</button>` : 
              `<button class="boton-reservar" disabled>📚 Agotado</button>`
            }
          </div>
        </div>
      `;

          // 👇 Evento de click en la tarjeta (modal de detalles)
      card.addEventListener("click", (e) => {
        // Lista de selectores a evitar
        const selectoresEvitar = [
          '.acciones-libro',
          '.boton-editar', 
          '.boton-eliminar', 
          '.boton-reservar', 
          '.boton-favorito',
          '.acciones-admin',
          'button' // Cualquier botón
        ];
        
        // Verificar si el click fue en algún elemento a evitar
        const clicEnAccion = selectoresEvitar.some(selector => 
          e.target.closest(selector)
        );
        
        if (clicEnAccion) {
          return; // No abrir el modal de detalles
        }
            Swal.fire({
              title: libro.titulo,
              html: `
                <div class="modal-libro">
                  <img src="${libro.imagen || libro.imagenUrl || 'ruta/por_defecto.jpg'}" 
                       alt="Portada de ${libro.titulo}" 
                       class="modal-portada">
                  <div class="modal-info">
                    <p><strong>Autor:</strong> ${libro.autor}</p>
                    <p><strong>Categoría:</strong> ${libro.categoria || libro.genero || 'N/A'}</p>
                    <p><strong>Registro:</strong> ${libro.registro || libro.isbn || 'N/A'}</p>
                    ${libro.signaturaTopografica ? `<p><strong>Signatura:</strong> ${libro.signaturaTopografica}</p>` : ''}
                    ${libro.paginas ? `<p><strong>Páginas:</strong> ${libro.paginas}</p>` : ''}
                    ${libro.ejemplar ? `<p><strong>Ejemplar:</strong> ${libro.ejemplar}</p>` : ''}
                    ${libro.cantidadRegistro ? `<p><strong>Cantidad Registro:</strong> ${libro.cantidadRegistro}</p>` : ''}
                    <p class="modal-sinopsis"><strong>Sinopsis:</strong> ${libro.sinopsis || libro.descripcion || 'Sin descripción'}</p>
                    ${libro.observaciones ? `<p class="modal-observaciones"><strong>Observaciones:</strong> ${libro.observaciones}</p>` : ''}
                    ${libro.url ? `<p><strong>URL:</strong> <a href="${libro.url}" target="_blank">${libro.url}</a></p>` : ''}
                  </div>
                </div>
              `,
              showCloseButton: true,
              confirmButtonText: "Cerrar",
              width: "600px",
              background: "#1e1e1e",
              color: "#f5f5f5",
              customClass: {
                popup: "swal-dark",
                title: "swal-dark-title",
                confirmButton: "swal-dark-btn"
              }
            });
          });

          contenedorLibros.appendChild(card);
        });

        // ✅ Agregar eventos después de renderizar
        agregarEventos();
        mensajeSinResultados?.classList.remove("mostrar");

    } catch (error) {
      console.error("Error al cargar libros:", error);
      
      // Mostrar mensaje de error al usuario
      Swal.fire({
          title: '❌ Error de conexión',
          html: `
              <div style="text-align: left;">
                  <p>No se pudieron cargar los libros. Por favor verifica:</p>
                  <ul>
                      <li>Que el servidor esté ejecutándose en el puerto 8080</li>
                      <li>Que la API esté respondiendo correctamente</li>
                      <li>Que no haya problemas de red</li>
                  </ul>
                  <p>Error técnico: ${error.message}</p>
              </div>
          `,
          icon: 'error',
          confirmButtonText: 'Reintentar',
          showCancelButton: true,
          cancelButtonText: 'Cerrar'
      }).then((result) => {
          if (result.isConfirmed) {
              // Reintentar cargar los libros
              cargarLibros();
          }
      });

      // Si hay un contenedor de mensaje sin resultados, mostrarlo
      if (mensajeSinResultados) {
          mensajeSinResultados.innerHTML = `
              <div class="error-message">
                  <i class="fas fa-exclamation-triangle"></i>
                  <p>No se pudieron cargar los libros</p>
                  <small>Por favor, verifica la conexión con el servidor</small>
              </div>
          `;
          mensajeSinResultados.classList.add("mostrar");
      }
    }
  }

  function agregarEventos() {
    const botonesEliminar = document.querySelectorAll(".boton-eliminar");
    const botonesEditar = document.querySelectorAll(".boton-editar");
    const botonesReservar = document.querySelectorAll(".boton-reservar");

    // Eventos de reservar (sin cambios)
    botonesReservar.forEach(boton => {
      boton.addEventListener("click", async function () {
        if (this.disabled) {
          Swal.fire("❌ Libro agotado", "Este libro no está disponible actualmente.", "error");
          return;
        }

        const libroId = parseInt(this.getAttribute("data-id"));
        const usuario = JSON.parse(localStorage.getItem("usuario"));

        if (!usuario || !usuario.id) {
          Swal.fire("⚠️ Debes iniciar sesión para reservar un libro", "", "warning");
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
            const reserva = await response.json();
            Swal.fire("✅ Reserva creada", "Tu solicitud está pendiente de aprobación.", "success");
            cargarLibros();
          } else {
            const mensaje = await response.text();
            
            if (mensaje.includes("Ya tienes una reserva activa")) {
              Swal.fire("ℹ️ Información", mensaje, "info");
            } else if (mensaje.includes("No hay ejemplares disponibles")) {
              Swal.fire("📚 Sin stock", mensaje, "warning");
            } else {
              Swal.fire("⚠️ Aviso", mensaje, "warning");
            }
          }
        } catch (error) {
          console.error("Error de conexión:", error);
          Swal.fire("❌ Error de conexión", "Hubo un problema al conectar con el servidor.", "error");
        }
      });
    });

// 🔧 FUNCIÓN DE ELIMINACIÓN MEJORADA CON VERIFICACIONES

botonesEliminar.forEach(boton => {
  boton.addEventListener("click", async function () {
    const id = this.getAttribute("data-id");
    
    // ✅ VERIFICACIÓN 1: ID válido
    if (!id || id === 'null' || id === 'undefined') {
      Swal.fire("❌ Error", "ID del libro no válido", "error");
      return;
    }

    console.log(`🔍 Intentando eliminar libro ID: ${id}`);

    // ✅ VERIFICACIÓN 2: El libro existe en el servidor
    try {
      const verificarResponse = await fetch(`http://localhost:8080/api/libros/${id}`);
      
      if (!verificarResponse.ok) {
        console.log(`❌ Libro ID ${id} no encontrado en servidor`);
        
        Swal.fire({
          title: "⚠️ Libro no encontrado",
          html: `
            <div style="text-align: center;">
              <p>El libro con ID <strong>${id}</strong> ya no existe en el servidor.</p>
              <hr style="margin: 20px 0; border: 1px solid #444;">
              <p>Esto puede ocurrir por:</p>
              <ul style="text-align: left; margin: 10px 0; padding-left: 20px;">
                <li>📚 El libro ya fue eliminado previamente</li>
                <li>🔄 Datos desactualizados en la página</li>
                <li>🔧 Problemas de sincronización</li>
              </ul>
              <p style="margin-top: 20px;"><em>Actualizando la lista de libros...</em></p>
            </div>
          `,
          icon: "info",
          confirmButtonText: "Entendido",
          background: "#1a1a2e",
          color: "#e4e6ea"
        }).then(() => {
          // Recargar libros para sincronizar
          cargarLibros();
        });
        return;
      }

      // Si llegamos aquí, el libro existe
      const libroData = await verificarResponse.json();
      console.log("✅ Libro encontrado:", libroData);

    } catch (error) {
      console.error("❌ Error al verificar libro:", error);
      Swal.fire("❌ Error de conexión", "No se puede verificar si el libro existe", "error");
      return;
    }

    // ✅ VERIFICACIÓN 3: Obtener datos del libro para personalizar el mensaje
    const card = this.closest(".card");
    const titulo = card ? card.querySelector("h3")?.textContent || "este libro" : "este libro";
    
    // ✅ CONFIRMACIÓN (tu código existente)
    const confirmacion = await Swal.fire({
      title: "⚠️ ¿Estás seguro?",
      html: `
        <div style="text-align: center; font-size: 1.1rem; line-height: 1.6;">
          <p style="margin-bottom: 20px;">
            <strong>¿Seguro que quieres eliminar el libro?</strong>
          </p>
          
          <div style="background: rgba(220, 53, 69, 0.1); border: 2px solid #dc3545; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="color: #dc3545; font-weight: 600; font-size: 1.2rem; margin-bottom: 15px;">
              ⚠️ SE BORRARÁ TODA LA INFORMACIÓN Y LAS RESERVAS HECHAS
            </p>
            <div style="text-align: left; margin: 15px 0;">
              <p>📚 <strong>Libro:</strong> "${titulo}"</p>
              <p>🔢 <strong>ID:</strong> ${id}</p>
              <p>🗑️ <strong>Todas las reservas asociadas</strong></p>
              <p>📊 <strong>Todo el historial relacionado</strong></p>
            </div>
          </div>
          
          <p style="color: #6c757d; font-style: italic; margin-top: 15px;">
            Esta acción no se puede deshacer
          </p>
        </div>
      `,
      icon: "warning",
      background: "#1a1a2e",
      color: "#e4e6ea",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "🗑️ Sí, eliminar todo",
      cancelButtonText: "❌ Cancelar",
      width: "500px"
    });

    if (confirmacion.isConfirmed) {
      // ✅ LOADING
      Swal.fire({
        title: "🗑️ Eliminando...",
        html: `
          <div style="text-align: center;">
            <p>Eliminando "${titulo}" (ID: ${id})</p>
            <p style="color: #6c757d; font-size: 0.9rem;">Verificando con el servidor...</p>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: "#1a1a2e",
        color: "#e4e6ea",
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        console.log(`🚀 Enviando DELETE a: http://localhost:8080/api/libros/${id}`);
        
        const response = await fetch(`http://localhost:8080/api/libros/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });

        console.log(`📊 Respuesta del servidor: ${response.status} ${response.statusText}`);

        if (response.ok) {
          // ✅ ÉXITO
          console.log("✅ Libro eliminado exitosamente");
          
          Swal.fire({
            title: "✅ ¡Eliminado exitosamente!",
            html: `
              <div style="text-align: center;">
                <div style="background: rgba(40, 167, 69, 0.1); border: 2px solid #28a745; border-radius: 10px; padding: 20px; margin: 20px 0;">
                  <p style="color: #28a745; font-weight: 600; font-size: 1.2rem; margin-bottom: 15px;">
                    🎉 ELIMINACIÓN COMPLETADA
                  </p>
                  <div style="text-align: left; margin: 15px 0;">
                    <p>✅ <strong>Libro eliminado:</strong> "${titulo}"</p>
                    <p>✅ <strong>ID eliminado:</strong> ${id}</p>
                    <p>✅ <strong>Base de datos actualizada</strong></p>
                  </div>
                </div>
              </div>
            `,
            icon: "success",
            confirmButtonText: "Perfecto",
            confirmButtonColor: "#28a745",
            background: "#1a1a2e",
            color: "#e4e6ea",
            timer: 3000,
            timerProgressBar: true
          });

          // Recargar libros
          cargarLibros();

        } else {
          // ❌ ERROR DEL SERVIDOR
          const errorText = await response.text();
          console.error(`❌ Error del servidor (${response.status}):`, errorText);

          // Manejar diferentes tipos de error
          let mensajeError = "";
          
          if (response.status === 404) {
            mensajeError = `
              <div style="background: rgba(255, 193, 7, 0.1); border: 2px solid #ffc107; border-radius: 10px; padding: 20px;">
                <p style="color: #ffc107; font-weight: 600;">📚 El libro ya no existe</p>
                <p>El libro fue eliminado previamente o no se encuentra en la base de datos.</p>
              </div>
            `;
          } else if (response.status === 400 && errorText.includes("foreign key")) {
            mensajeError = `
              <div style="background: rgba(255, 193, 7, 0.1); border: 2px solid #ffc107; border-radius: 10px; padding: 20px;">
                <p style="color: #ffc107; font-weight: 600;">🔗 El libro tiene reservas activas</p>
                <p>No se puede eliminar porque tiene reservas o préstamos asociados.</p>
              </div>
            `;
          } else {
            mensajeError = `
              <div style="background: rgba(220, 53, 69, 0.1); border: 2px solid #dc3545; border-radius: 10px; padding: 20px;">
                <p style="color: #dc3545; font-weight: 600;">❌ Error del servidor</p>
                <p><strong>Código:</strong> ${response.status}</p>
                <p><strong>Mensaje:</strong> ${errorText}</p>
              </div>
            `;
          }

          Swal.fire({
            title: "❌ No se pudo eliminar",
            html: mensajeError,
            icon: "error",
            confirmButtonText: "Entendido",
            background: "#1a1a2e",
            color: "#e4e6ea",
            width: "600px"
          }).then(() => {
            // Recargar libros para sincronizar
            cargarLibros();
          });
        }

      } catch (error) {
        console.error("❌ Error de red/conexión:", error);
        
        Swal.fire({
          title: "❌ Error de conexión",
          html: `
            <div style="text-align: center;">
              <div style="background: rgba(220, 53, 69, 0.1); border: 2px solid #dc3545; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <p style="color: #dc3545; font-weight: 600;">🌐 Sin conexión al servidor</p>
                <p><strong>Error:</strong> ${error.message}</p>
              </div>
              
              <p><strong>Posibles soluciones:</strong></p>
              <ul style="text-align: left; margin: 15px 0;">
                <li>🔄 Verificar que el servidor esté ejecutándose</li>
                <li>🌐 Comprobar la conexión a internet</li>
                <li>🔧 Revisar la URL del API</li>
              </ul>
            </div>
          `,
          icon: "error",
          confirmButtonText: "Entendido",
          background: "#1a1a2e",
          color: "#e4e6ea",
          width: "600px"
        });
      }
    }
  });
});
      botonesEditar.forEach(boton => {
          boton.addEventListener("click", async function () {
              const id = this.getAttribute("data-id");

              // 🔥 CAMBIO IMPORTANTE: Obtener datos completos desde el servidor
              try {
                  const response = await fetch(`http://localhost:8080/api/libros/${id}`);

                  if (!response.ok) {
                      throw new Error("No se pudo obtener la información del libro");
                  }

                  const libro = await response.json();
                  console.log("📖 Datos del libro cargados:", libro);

                  Swal.fire({
                      title: "✏️ Editar Libro",
                      html: `
          <div class="form-container">
            <div class="form-section">
              <h3 class="section-title">📖 Información Principal</h3>
              <div class="form-grid">
                <div class="form-field">
                  <label>Título *</label>
                  <input id="swal-titulo" class="form-input required" placeholder="Título" value="${libro.titulo || ''}">
                </div>
                <div class="form-field">
                  <label>Autor *</label>
                  <input id="swal-autor" class="form-input required" placeholder="Autor" value="${libro.autor || ''}">
                </div>
                <div class="form-field">
                  <label>Categoría</label>
                  <input id="swal-categoria" class="form-input" placeholder="Categoría" value="${libro.categoria || libro.genero || ''}">
                </div>
                <div class="form-field">
                  <label>Registro</label>
                  <input id="swal-registro" class="form-input" placeholder="Registro" value="${libro.registro || ''}">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">📊 Detalles Técnicos</h3>
              <div class="form-grid">
                <div class="form-field">
                  <label>Signatura Topográfica</label>
                  <input id="swal-signatura" class="form-input" placeholder="Signatura Topográfica" value="${libro.signaturaTopografica || ''}">
                </div>
                <div class="form-field">
                  <label>Cantidad Registro</label>
                  <input id="swal-cantidad-registro" class="form-input" type="number" placeholder="Cantidad Registro" value="${libro.cantidadRegistro || ''}">
                </div>
                <div class="form-field">
                  <label>Páginas</label>
                  <input id="swal-paginas" class="form-input" type="number" placeholder="Páginas" value="${libro.paginas || ''}">
                </div>
                <div class="form-field">
                  <label>Cantidad Disponible</label>
                  <input id="swal-cantidad" class="form-input" type="number" placeholder="Cantidad disponible" value="${libro.cantidad || ''}">
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">🖼️ Información Adicional</h3>
              <div class="form-field">
                <label>Ejemplar</label>
                <input id="swal-ejemplar" class="form-input" placeholder="Ejemplar" value="${libro.ejemplar || ''}">
              </div>
              <div class="form-field">
                <label>URL de la Imagen</label>
                <input id="swal-imagen" class="form-input" placeholder="URL Imagen" value="${libro.imagen || libro.imagenUrl || ''}">
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">📝 Descripción</h3>
              <div class="form-field">
                <label>Sinopsis</label>
                <textarea id="swal-sinopsis" class="form-textarea" placeholder="Sinopsis">${libro.sinopsis || libro.descripcion || ''}</textarea>
              </div>
              <div class="form-field">
                <label>Observaciones</label>
                <textarea id="swal-observaciones" class="form-textarea" placeholder="Observaciones">${libro.observaciones || ''}</textarea>
              </div>
            </div>
          </div>

          <style>
            .form-container {
              max-height: 600px;
              overflow-y: auto;
              padding: 0 5px;
              text-align: left;
            }

            .form-section {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 15px;
              padding: 20px;
              margin-bottom: 20px;
            }

            .section-title {
              color: #4a90e2;
              font-size: 1.2rem;
              margin-bottom: 15px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .form-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
            }

            .form-field {
              display: flex;
              flex-direction: column;
            }

            .form-field label {
              color: #e4e6ea;
              font-size: 0.9rem;
              font-weight: 600;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 5px;
            }

            .form-input, .form-textarea {
              background: rgba(42, 48, 66, 0.8) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 10px !important;
              padding: 12px 15px !important;
              color: #e4e6ea !important;
              font-size: 0.95rem !important;
              transition: all 0.3s ease !important;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            }

            .form-input:focus, .form-textarea:focus {
              border-color: #4a90e2 !important;
              box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2) !important;
              transform: translateY(-1px) !important;
            }

            .form-textarea {
              resize: vertical !important;
              min-height: 80px !important;
              font-family: inherit !important;
            }

            .required {
              border-color: rgba(247, 183, 49, 0.3) !important;
            }

            .form-container::-webkit-scrollbar {
              width: 8px;
            }

            .form-container::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }

            .form-container::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #4a90e2, #357abd);
              border-radius: 10px;
            }
          </style>
        `,
                      focusConfirm: false,
                      showCancelButton: true,
                      confirmButtonText: "💾 Guardar Cambios",
                      cancelButtonText: "❌ Cancelar",
                      width: "900px",
                      background: "#1a1a2e",
                      color: "#e4e6ea",
                      customClass: {
                          popup: "swal-dark-modern",
                          title: "swal-dark-title",
                          confirmButton: "swal-confirm-modern",
                          cancelButton: "swal-cancel-modern"
                      },
                      didOpen: () => {
                          const style = document.createElement('style');
                          style.textContent = `
            .swal-dark-modern {
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 20px !important;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
            }
            
            .swal-confirm-modern {
              background: linear-gradient(135deg, #4a90e2, #357abd) !important;
              border: none !important;
              border-radius: 10px !important;
              padding: 12px 25px !important;
              font-weight: 600 !important;
              transition: all 0.3s ease !important;
            }
            
            .swal-confirm-modern:hover {
              background: linear-gradient(135deg, #357abd, #2868a8) !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 20px rgba(74, 144, 226, 0.3) !important;
            }
            
            .swal-cancel-modern {
              background: rgba(255, 255, 255, 0.1) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 10px !important;
              padding: 12px 25px !important;
              font-weight: 600 !important;
              color: #e4e6ea !important;
            }
            
            .swal-cancel-modern:hover {
              background: rgba(255, 255, 255, 0.2) !important;
            }
          `;
                          document.head.appendChild(style);
                      },
                      preConfirm: () => {
                          const titulo = document.getElementById("swal-titulo").value.trim();
                          const autor = document.getElementById("swal-autor").value.trim();

                          if (!titulo || !autor) {
                              Swal.showValidationMessage('⚠️ Título y Autor son campos obligatorios');
                              return false;
                          }

                          return {
                              titulo: titulo,
                              autor: autor,
                              categoria: document.getElementById("swal-categoria").value.trim(),
                              registro: document.getElementById("swal-registro").value.trim(),
                              signaturaTopografica: document.getElementById("swal-signatura").value.trim(),
                              cantidadRegistro: parseInt(document.getElementById("swal-cantidad-registro").value) || null,
                              paginas: parseInt(document.getElementById("swal-paginas").value) || null,
                              ejemplar: document.getElementById("swal-ejemplar").value.trim(),
                              imagen: document.getElementById("swal-imagen").value.trim(),
                              cantidad: parseInt(document.getElementById("swal-cantidad").value) || null,
                              sinopsis: document.getElementById("swal-sinopsis").value.trim(),
                              observaciones: document.getElementById("swal-observaciones").value.trim()
                          };
                      }
                  }).then(async (resultado) => {
                      if (resultado.isConfirmed) {
                          const datosActualizados = resultado.value;

                          // Preparar datos para enviar
                          const datosLimpios = {
                              titulo: datosActualizados.titulo,
                              autor: datosActualizados.autor,
                              genero: datosActualizados.categoria || "Sin categoría",
                              registro: datosActualizados.registro || null,
                              signaturaTopografica: datosActualizados.signaturaTopografica || null,
                              cantidadRegistro: datosActualizados.cantidadRegistro || null,
                              paginas: datosActualizados.paginas || null,
                              ejemplar: datosActualizados.ejemplar || null,
                              imagen: datosActualizados.imagen || null,
                              cantidad: datosActualizados.cantidad || null,
                              sinopsis: datosActualizados.sinopsis || null,
                              observaciones: datosActualizados.observaciones || null
                          };

                          try {
                              const response = await fetch(`http://localhost:8080/api/libros/${id}`, {
                                  method: "PUT",
                                  headers: {
                                      "Content-Type": "application/json",
                                      "Accept": "application/json"
                                  },
                                  body: JSON.stringify(datosLimpios)
                              });

                              if (!response.ok) {
                                  const errorText = await response.text();
                                  throw new Error(`Error ${response.status}: ${errorText}`);
                              }

                              Swal.fire("✅ Actualizado", "El libro fue actualizado exitosamente.", "success");
                              cargarLibros();
                          } catch (error) {
                              console.error("❌ Error al actualizar:", error);
                              Swal.fire("❌ Error", "No se pudo actualizar el libro: " + error.message, "error");
                          }
                      }
                  });

              } catch (error) {
                  console.error("❌ Error al cargar libro:", error);
                  Swal.fire("❌ Error", "No se pudo cargar la información del libro", "error");
              }
          });
      });

  }

  // 🔍 Búsqueda (sin cambios)
  if (inputBuscar) {
    inputBuscar.addEventListener("input", function () {
      const filtro = inputBuscar.value.toLowerCase();
      const tarjetas = contenedorLibros.querySelectorAll(".card");
      let coincidencias = 0;

      tarjetas.forEach(card => {
        const titulo = card.querySelector("h3").textContent.toLowerCase();
        const autorTexto = card.querySelector("p")?.textContent.toLowerCase() || "";
        const coincide = titulo.includes(filtro) || autorTexto.includes(filtro);
        card.style.display = coincide ? "block" : "none";
        if (coincide) coincidencias++;
      });

      if (mensajeSinResultados) {
        if (coincidencias === 0) {
          mensajeSinResultados.classList.add("mostrar");
        } else {
          mensajeSinResultados.classList.remove("mostrar");
        }
      }
    });
  }

  // ✅ Finalmente: carga inicial
  cargarLibros();
});

// Mover la función toggleFavorito fuera del DOMContentLoaded
window.toggleFavorito = function(libroId) {
    console.log("🔄 Toggle favorito llamado para libro ID:", libroId);
    
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    
    if (!usuario || !usuario.id) {
        Swal.fire({
            title: "⚠️ Necesitas iniciar sesión",
            text: "Para agregar libros a favoritos, debes estar registrado",
            icon: "warning",
            confirmButtonText: "Ir al login",
            showCancelButton: true,
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "login.html";
            }
        });
        return;
    }

    const favoritosKey = `favoritos_${usuario.id}`;
    let favoritos = JSON.parse(localStorage.getItem(favoritosKey) || '[]');
    
    const yaEsFavorito = favoritos.some(fav => fav.libroId === libroId);
    const libro = librosData.find(l => l.id === libroId);

    if (!libro) {
        console.error("Libro no encontrado:", libroId);
        return;
    }
    
    if (yaEsFavorito) {
        // Quitar de favoritos
        favoritos = favoritos.filter(fav => fav.libroId !== libroId);
        localStorage.setItem(favoritosKey, JSON.stringify(favoritos));
        
        Swal.fire({
            title: "💔 Quitado de favoritos",
            text: `"${libro.titulo}" fue removido de tus favoritos`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

        // Actualizar icono
        const btn = document.querySelector(`.boton-favorito[data-libro-id="${libroId}"]`);
        if (btn) {
            btn.classList.remove('favorito-activo');
            btn.querySelector('i').className = 'far fa-heart';
        }
    } else {
        // Agregar a favoritos
        favoritos.push({
            libroId: libroId,
            fechaAgregado: new Date().toISOString()
        });
        localStorage.setItem(favoritosKey, JSON.stringify(favoritos));
        
        Swal.fire({
            title: "❤️ ¡Agregado a favoritos!",
            text: `"${libro.titulo}" se agregó a tu lista`,
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Seguir navegando",
            cancelButtonText: "Ver favoritos",
            timer: 3000,
            timerProgressBar: true
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.href = "mis-favoritos.html";
            }
        });

        // Actualizar icono
        const btn = document.querySelector(`.boton-favorito[data-libro-id="${libroId}"]`);
        if (btn) {
            btn.classList.add('favorito-activo');
            btn.querySelector('i').className = 'fas fa-heart';
        }
    }
    
    return !yaEsFavorito; // Retorna true si se agregó, false si se quitó

    
};