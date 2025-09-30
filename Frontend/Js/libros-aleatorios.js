// Script para cargar libros aleatorios desde la API de Spring Boot
(function() {
  // Configuración de la API
  const API_BASE_URL = 'http://localhost:8080/api/libros'; // Ajusta el puerto si es necesario
  const CANTIDAD_LIBROS = 8;

  // Función para crear HTML de un libro
  function crearLibroHTML(libro) {
    // Determinar disponibilidad
    const disponible = libro.disponible === true || 
                      (libro.estado && libro.estado.toLowerCase() === 'disponible' && 
                       libro.cantidad && libro.cantidad > 0);
    
    // Imagen por defecto si no tiene
    const imagenUrl = libro.imagen && libro.imagen.trim() !== '' 
      ? libro.imagen 
      : 'https://via.placeholder.com/200x250/1a1a1a/caa54f?text=Sin+Portada';
    
    return `
      <div class="libro-card" data-id="${libro.id}">
        <img src="${imagenUrl}" 
             alt="${libro.titulo}" 
             class="libro-portada" 
             onerror="this.src='https://via.placeholder.com/200x250/1a1a1a/caa54f?text=Sin+Portada'">
        <h4 class="libro-titulo">${libro.titulo}</h4>
        <p class="libro-autor">${libro.autor}</p>
        ${libro.genero ? `<span class="libro-genero">${libro.genero}</span>` : ''}
        <span class="${disponible ? 'libro-disponible' : 'libro-no-disponible'}">
          ${disponible ? '✓ Disponible' : '✗ No disponible'}
        </span>
      </div>
    `;
  }

  // Función para crear skeleton loader
  function crearSkeletonHTML() {
    return `
      <div class="libro-card skeleton">
        <div class="libro-portada"></div>
        <h4 class="libro-titulo">Cargando...</h4>
        <p class="libro-autor">Cargando...</p>
        <span class="libro-disponible">Cargando...</span>
      </div>
    `;
  }

  // Función principal para cargar libros desde la API
  async function cargarLibrosDesdeAPI() {
    const container = document.getElementById('libros-container');
    
    if (!container) {
      console.error('❌ No se encontró el contenedor de libros');
      return;
    }

    // Mostrar skeletons mientras carga
    container.innerHTML = Array(CANTIDAD_LIBROS).fill(crearSkeletonHTML()).join('');

    try {
      console.log('🔄 Cargando libros desde:', `${API_BASE_URL}/aleatorios`);
      
      const response = await fetch(`${API_BASE_URL}/aleatorios?cantidad=${CANTIDAD_LIBROS}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const libros = await response.json();
      console.log('✅ Libros cargados:', libros.length);

      // Verificar si hay libros
      if (libros.length === 0) {
        container.innerHTML = `
          <div class="no-libros" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #c0c0c0;">
            <i style="font-size: 3rem; margin-bottom: 1rem; display: block;">📚</i>
            <h3 style="color: #caa54f; margin-bottom: 0.5rem;">No hay libros disponibles</h3>
            <p>Aún no se han agregado libros a la biblioteca.</p>
          </div>
        `;
        return;
      }

      // Renderizar libros
      container.innerHTML = libros.map(libro => crearLibroHTML(libro)).join('');
      
      // Agregar event listeners a las tarjetas
      document.querySelectorAll('.libro-card').forEach(card => {
        card.addEventListener('click', function() {
          const libroId = this.getAttribute('data-id');
          const titulo = this.querySelector('.libro-titulo').textContent;
          console.log('📖 Libro seleccionado:', titulo, '(ID:', libroId, ')');
          
          // Aquí puedes redirigir a la página de detalles del libro
          // window.location.href = `detalle-libro.html?id=${libroId}`;
          
          // O abrir un modal con más información
          mostrarDetalleLibro(libroId);
        });
      });

    } catch (error) {
      console.error('❌ Error al cargar libros:', error);
      
      // Mostrar mensaje de error amigable
      container.innerHTML = `
        <div class="error-libros" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff6b6b;">
          <i style="font-size: 3rem; margin-bottom: 1rem; display: block;">⚠️</i>
          <h3 style="color: #E4B343; margin-bottom: 0.5rem;">Error al cargar libros</h3>
          <p>No se pudo conectar con el servidor. Por favor, intenta de nuevo más tarde.</p>
          <button onclick="location.reload()" 
                  style="margin-top: 20px; padding: 10px 20px; background: #2B7A78; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Reintentar
          </button>
        </div>
      `;
    }
  }

  // Función para mostrar detalles de un libro (opcional)
  async function mostrarDetalleLibro(libroId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${libroId}`);
      if (!response.ok) throw new Error('Libro no encontrado');
      
      const libro = await response.json();
      
      // Aquí puedes usar SweetAlert2 o crear un modal personalizado
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: libro.titulo,
          html: `
            <div style="text-align: left;">
              <p><strong>Autor:</strong> ${libro.autor}</p>
              ${libro.genero ? `<p><strong>Género:</strong> ${libro.genero}</p>` : ''}
              ${libro.sinopsis ? `<p><strong>Sinopsis:</strong> ${libro.sinopsis}</p>` : ''}
              ${libro.paginas ? `<p><strong>Páginas:</strong> ${libro.paginas}</p>` : ''}
              <p><strong>Estado:</strong> ${libro.estado}</p>
              <p><strong>Cantidad disponible:</strong> ${libro.cantidad || 0}</p>
            </div>
          `,
          imageUrl: libro.imagen || 'https://via.placeholder.com/200x250/1a1a1a/caa54f?text=Sin+Portada',
          imageWidth: 200,
          imageAlt: libro.titulo,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#2B7A78'
        });
      } else {
        // Fallback si no hay SweetAlert2
        alert(`${libro.titulo}\nAutor: ${libro.autor}\nEstado: ${libro.estado}`);
      }
      
    } catch (error) {
      console.error('Error al obtener detalles del libro:', error);
    }
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarLibrosDesdeAPI);
  } else {
    cargarLibrosDesdeAPI();
  }

  // Exponer función para recargar libros (opcional)
  window.recargarLibros = cargarLibrosDesdeAPI;
})();