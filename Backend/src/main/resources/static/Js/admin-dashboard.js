// ============================== //
// 🌐 CONFIGURACIÓN GLOBAL
// ============================== //
const API_URL = "http://localhost:8080/api";
const state = {
  libros: [],
  reservas: [],
  categorias: [],
  filteredLibros: [],
  filteredReservas: [],
  currentPage: 1,
  currentPageReservas: 1,
  itemsPerPage: 10,
  charts: { categorias: null, estado: null }
};

// ============================== //
// 🚀 INICIALIZACIÓN
// ============================== //
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando Dashboard Administrativo...");
  
  if (!verificarAdmin()) return;
  
  setupNavigation();
  setupSidebarToggle();
  await cargarDatosIniciales();
  setupEventListeners();
  
  console.log("✅ Dashboard cargado");
});

// ============================== //
// 🔐 VERIFICAR ADMIN
// ============================== //
function verificarAdmin() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (!usuario || usuario.rol?.toUpperCase() !== "ADMIN") {
    Swal.fire({
      title: "❌ Acceso Denegado",
      text: "Solo los administradores pueden acceder",
      icon: "error",
      confirmButtonText: "Ir al catálogo"
    }).then(() => window.location.href = "directorio.html");
    return false;
  }
  
  document.getElementById("adminName").textContent = usuario.nombre || "Admin";
  return true;
}

// ============================== //
// 🎯 NAVEGACIÓN
// ============================== //
function setupNavigation() {
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      cambiarSeccion(item.getAttribute('data-section'));
    });
  });
}

function cambiarSeccion(seccion) {
  // Actualizar nav activo
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector(`[data-section="${seccion}"]`)?.classList.add('active');
  
  // Cambiar contenido
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${seccion}`)?.classList.add('active');
  
  // Actualizar título
  const titulos = {
    dashboard: "Dashboard General",
    libros: "Gestión de Libros",
    reservas: "Gestión de Reservas",
    categorias: "Categorías",
    estadisticas: "Estadísticas Detalladas"
  };
  document.getElementById('pageTitle').textContent = titulos[seccion] || "Dashboard";
  
  cargarDatosSeccion(seccion);
}

// ============================== //
// 📱 SIDEBAR TOGGLE
// ============================== //
function setupSidebarToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  menuToggle?.addEventListener('click', () => sidebar.classList.toggle('active'));
  
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1200 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  });
}

// ============================== //
// 📊 CARGAR DATOS
// ============================== //
async function cargarDatosIniciales() {
  try {
    await Promise.all([cargarLibros(), cargarCategorias(), cargarReservas()]);
    actualizarDashboard();
    renderizarCategoriasGrid();
  } catch (error) {
    console.error("❌ Error:", error);
    Swal.fire("❌ Error", "No se pudieron cargar los datos", "error");
  }
}

async function cargarLibros() {
  const response = await fetch(`${API_URL}/libros`);
  if (!response.ok) throw new Error("Error al cargar libros");
  state.libros = await response.json();
  state.filteredLibros = [...state.libros];
  console.log(`✅ ${state.libros.length} libros cargados`);
}

async function cargarReservas() {
  const response = await fetch(`${API_URL}/reservas`);
  if (!response.ok) throw new Error("Error al cargar reservas");
  state.reservas = await response.json();
  state.filteredReservas = [...state.reservas];
  console.log(`✅ ${state.reservas.length} reservas cargadas`);
}

async function cargarCategorias() {
  const response = await fetch(`${API_URL}/libros/categorias`);
  if (!response.ok) throw new Error("Error al cargar categorías");
  const data = await response.json();
  state.categorias = data.categorias;
  
  const filterCategoria = document.getElementById('filterCategoria');
  if (filterCategoria) {
    state.categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      filterCategoria.appendChild(option);
    });
  }
  console.log(`✅ ${state.categorias.length} categorías cargadas`);
}

// ============================== //
// 📊 DASHBOARD
// ============================== //
function actualizarDashboard() {
  const disponibles = state.libros.filter(l => l.cantidad > 0).length;
  const pendientes = state.reservas.filter(r => r.estado === 'pendiente').length;
  
  document.getElementById('totalLibros').textContent = state.libros.length;
  document.getElementById('librosDisponibles').textContent = disponibles;
  document.getElementById('librosAgotados').textContent = state.libros.length - disponibles;
  document.getElementById('totalCategorias').textContent = state.categorias.length;
  document.getElementById('totalReservas').textContent = state.reservas.length;
  document.getElementById('reservasPendientes').textContent = pendientes;
  
  actualizarGraficos();
  mostrarUltimosLibros();
}

function actualizarGraficos() {
  const categoriasCounts = state.libros.reduce((acc, l) => {
    const cat = l.genero || l.categoria || "Sin categoría";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const disponibles = state.libros.filter(l => l.cantidad > 0).length;
  const agotados = state.libros.length - disponibles;
  
  crearGrafico('categoriasChart', 'bar', Object.keys(categoriasCounts), Object.values(categoriasCounts), 'categorias');
  crearGrafico('estadoChart', 'doughnut', ['Disponibles', 'Agotados'], [disponibles, agotados], 'estado');
}

function crearGrafico(canvasId, tipo, labels, data, chartKey) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  if (state.charts[chartKey]) state.charts[chartKey].destroy();
  
  const config = {
    type: tipo,
    data: {
      labels,
      datasets: [{
        label: tipo === 'bar' ? 'Cantidad de Libros' : '',
        data,
        backgroundColor: tipo === 'bar' ? 'rgba(59, 156, 150, 0.7)' : ['#28a745', '#C0392B'],
        borderColor: tipo === 'bar' ? '#3B9C96' : ['#20803a', '#A93226'],
        borderWidth: 2,
        borderRadius: tipo === 'bar' ? 8 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#F0EDE5' } } },
      scales: tipo === 'bar' ? {
        y: { beginAtZero: true, ticks: { color: '#D3D3D3' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        x: { ticks: { color: '#D3D3D3' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
      } : undefined
    }
  };
  
  state.charts[chartKey] = new Chart(ctx, config);
}

function mostrarUltimosLibros() {
  const container = document.getElementById('recentBooksContainer');
  if (!container) return;
  
  const ultimosLibros = state.libros.slice(-5).reverse();
  container.innerHTML = ultimosLibros.length === 0 
    ? '<p class="text-center text-muted">No hay libros registrados</p>'
    : ultimosLibros.map(libro => `
        <div class="book-item">
          <img src="${libro.imagen || 'https://via.placeholder.com/60x85?text=Sin+Portada'}" 
               alt="${libro.titulo}" onerror="this.src='https://via.placeholder.com/60x85?text=Sin+Portada'">
          <div class="book-item-info">
            <h4>${libro.titulo}</h4>
            <p>${libro.autor} • ${libro.genero || libro.categoria || 'Sin categoría'}</p>
          </div>
          <span class="status-badge ${libro.cantidad > 0 ? 'status-disponible' : 'status-agotado'}">
            ${libro.cantidad > 0 ? `${libro.cantidad} disponibles` : 'Agotado'}
          </span>
        </div>
      `).join('');
}

// ============================== //
// 📋 TABLA DE LIBROS
// ============================== //
function renderizarTablaLibros() {
  const tbody = document.getElementById('tablaLibros');
  if (!tbody) return;
  
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const librosPaginados = state.filteredLibros.slice(start, start + state.itemsPerPage);
  
  tbody.innerHTML = librosPaginados.length === 0 
    ? `<tr><td colspan="7" class="text-center"><div class="empty-state">
         <i class="fas fa-book-open"></i><h3>No se encontraron libros</h3>
         <p>Intenta ajustar los filtros</p></div></td></tr>`
    : librosPaginados.map(libro => `
        <tr>
          <td><img src="${libro.imagen || 'https://via.placeholder.com/50x70?text=Sin+Portada'}" 
               alt="${libro.titulo}" class="book-cover" 
               onerror="this.src='https://via.placeholder.com/50x70?text=Sin+Portada'"></td>
          <td><strong>${libro.titulo}</strong></td>
          <td>${libro.autor}</td>
          <td>${libro.genero || libro.categoria || 'Sin categoría'}</td>
          <td class="text-center"><strong>${libro.cantidad || 0}</strong></td>
          <td><span class="status-badge ${libro.cantidad > 0 ? 'status-disponible' : 'status-agotado'}">
              ${libro.cantidad > 0 ? 'Disponible' : 'Agotado'}</span></td>
          <td><div class="table-actions">
              <button class="btn-icon" onclick="verDetalleLibro(${libro.id})" title="Ver"><i class="fas fa-eye"></i></button>
              <button class="btn-icon" onclick="editarLibro(${libro.id})" title="Editar"><i class="fas fa-edit"></i></button>
              <button class="btn-icon danger" onclick="eliminarLibro(${libro.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>
      `).join('');
  
  renderizarPaginacion('pagination', state.filteredLibros.length, state.currentPage, cambiarPagina);
}

// ============================== //
// 📄 PAGINACIÓN GENÉRICA
// ============================== //
function renderizarPaginacion(containerId, totalItems, currentPage, callback) {
  const pagination = document.getElementById(containerId);
  if (!pagination) return;
  
  const totalPages = Math.ceil(totalItems / state.itemsPerPage);
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="${callback.name}(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="${callback.name}(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<span class="page-btn" style="border:none;cursor:default;">...</span>';
    }
  }
  
  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} 
            onclick="${callback.name}(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
  
  pagination.innerHTML = html;
}

function cambiarPagina(page) {
  const totalPages = Math.ceil(state.filteredLibros.length / state.itemsPerPage);
  if (page < 1 || page > totalPages) return;
  state.currentPage = page;
  renderizarTablaLibros();
  document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
}

// ============================== //
// 🎨 CATEGORÍAS
// ============================== //
function renderizarCategoriasGrid() {
  const grid = document.getElementById('categoriasGrid');
  if (!grid) return;
  
  const iconos = {
    'Semilla': 'fa-seedling', 'Semilla 2': 'fa-leaf', 'Referencia': 'fa-bookmark',
    'Obras Generales': 'fa-books', 'Filosofía': 'fa-brain', 'Sociales': 'fa-users',
    'Religión': 'fa-praying-hands', 'Lenguaje': 'fa-language', 'Ciencias Puras': 'fa-flask',
    'Artes y Recreación': 'fa-palette', 'Literatura': 'fa-book-open', 'Historia': 'fa-landmark',
    'Revistas': 'fa-newspaper', 'Descarte': 'fa-trash-alt'
  };
  
  grid.innerHTML = state.categorias.map(cat => {
    const cantidad = state.libros.filter(l => l.genero === cat || l.categoria === cat).length;
    return `
      <div class="category-card" onclick="filtrarPorCategoriaEnTabla('${cat}')">
        <div class="category-icon"><i class="fas ${iconos[cat] || 'fa-book'}"></i></div>
        <h3>${cat}</h3>
        <p class="category-count">${cantidad}</p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">libros</p>
      </div>`;
  }).join('');
}

function filtrarPorCategoriaEnTabla(categoria) {
  cambiarSeccion('libros');
  document.getElementById('filterCategoria').value = categoria;
  aplicarFiltros();
}

// ============================== //
// 🔍 FILTROS
// ============================== //
function aplicarFiltros() {
  const search = document.getElementById('searchLibros')?.value.toLowerCase() || '';
  const cat = document.getElementById('filterCategoria')?.value || '';
  const est = document.getElementById('filterEstado')?.value || '';
  
  state.filteredLibros = state.libros.filter(libro => {
    const matchSearch = libro.titulo.toLowerCase().includes(search) ||
                       libro.autor.toLowerCase().includes(search) ||
                       (libro.genero || libro.categoria || '').toLowerCase().includes(search);
    const matchCat = !cat || libro.genero === cat || libro.categoria === cat;
    const matchEst = !est || (est === 'disponible' && libro.cantidad > 0) || (est === 'agotado' && libro.cantidad === 0);
    return matchSearch && matchCat && matchEst;
  });
  
  state.currentPage = 1;
  renderizarTablaLibros();
}

// ============================== //
// 📋 TABLA DE RESERVAS
// ============================== //
function renderizarTablaReservas() {
  const tbody = document.getElementById('tablaReservas');
  if (!tbody) return;
  
  const start = (state.currentPageReservas - 1) * state.itemsPerPage;
  const reservasPaginadas = state.filteredReservas.slice(start, start + state.itemsPerPage);
  
  tbody.innerHTML = reservasPaginadas.length === 0 
    ? `<tr><td colspan="8" class="text-center"><div class="empty-state">
         <i class="fas fa-bookmark"></i><h3>No se encontraron reservas</h3></div></td></tr>`
    : reservasPaginadas.map(r => {
        const diasInfo = calcularDiasReserva(r);
        const acciones = generarAccionesReserva(r);
        
        return `
          <tr>
            <td><strong>#${r.id}</strong></td>
            <td>${r.usuario?.nombre || 'Desconocido'}</td>
            <td>${r.libro?.titulo || 'Desconocido'}</td>
            <td>${r.fechaReserva ? new Date(r.fechaReserva).toLocaleDateString('es-ES') : 'N/A'}</td>
            <td>${r.fechaLimiteDevolucion ? new Date(r.fechaLimiteDevolucion).toLocaleDateString('es-ES') : 'N/A'}</td>
            <td><span class="badge-${r.estado}">${getEstadoIcon(r.estado)} ${capitalizeFirst(r.estado)}</span></td>
            <td><span class="dias-info ${diasInfo.class}">${diasInfo.text}</span></td>
            <td><div class="table-actions">${acciones}</div></td>
          </tr>`;
      }).join('');
  
  renderizarPaginacion('paginationReservas', state.filteredReservas.length, state.currentPageReservas, cambiarPaginaReservas);
  actualizarStatsReservas();
}

function calcularDiasReserva(reserva) {
  if (reserva.estado === 'aprobada' && reserva.fechaLimiteDevolucion) {
    const diff = Math.ceil((new Date(reserva.fechaLimiteDevolucion) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `${Math.abs(diff)} días de retraso`, class: 'urgente' };
    if (diff <= 3) return { text: `${diff} días restantes`, class: 'advertencia' };
    return { text: `${diff} días restantes`, class: 'normal' };
  }
  if (reserva.estado === 'vencida') return { text: 'Vencida', class: 'urgente' };
  if (reserva.estado === 'devuelta') return { text: 'Devuelto', class: 'neutral' };
  return { text: '-', class: 'neutral' };
}

function generarAccionesReserva(reserva) {
  let acciones = '';
  if (reserva.estado === 'pendiente') {
    acciones = `
      <button class="btn-icon success" onclick="aprobarReserva(${reserva.id})" title="Aprobar"><i class="fas fa-check"></i></button>
      <button class="btn-icon danger" onclick="rechazarReserva(${reserva.id})" title="Rechazar"><i class="fas fa-times"></i></button>`;
  } else if (reserva.estado === 'aprobada' || reserva.estado === 'vencida') {
    acciones = `<button class="btn-icon warning" onclick="devolverLibro(${reserva.id})" title="Devolver"><i class="fas fa-undo"></i></button>`;
  }
  return acciones + `<button class="btn-icon" onclick="verDetalleReserva(${reserva.id})" title="Ver"><i class="fas fa-eye"></i></button>`;
}

function actualizarStatsReservas() {
  ['pendiente', 'aprobada', 'vencida', 'devuelta'].forEach(estado => {
    const id = `stat${capitalizeFirst(estado)}s`;
    const elem = document.getElementById(id);
    if (elem) elem.textContent = state.reservas.filter(r => r.estado === estado).length;
  });
}

function cambiarPaginaReservas(page) {
  const totalPages = Math.ceil(state.filteredReservas.length / state.itemsPerPage);
  if (page < 1 || page > totalPages) return;
  state.currentPageReservas = page;
  renderizarTablaReservas();
  document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
}

function aplicarFiltrosReservas() {
  const search = document.getElementById('searchReservas')?.value.toLowerCase() || '';
  const est = document.getElementById('filterEstadoReserva')?.value || '';
  const orden = document.getElementById('filterOrdenReserva')?.value || 'recientes';
  
  state.filteredReservas = state.reservas.filter(r => {
    const matchSearch = r.usuario?.nombre?.toLowerCase().includes(search) ||
                       r.libro?.titulo?.toLowerCase().includes(search) ||
                       r.id?.toString().includes(search);
    return matchSearch && (!est || r.estado === est);
  });
  
  if (orden === 'recientes') state.filteredReservas.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
  else if (orden === 'antiguas') state.filteredReservas.sort((a, b) => new Date(a.fechaReserva) - new Date(b.fechaReserva));
  else if (orden === 'proximasVencer') {
    state.filteredReservas = state.filteredReservas.filter(r => r.estado === 'aprobada' && r.fechaLimiteDevolucion);
    state.filteredReservas.sort((a, b) => new Date(a.fechaLimiteDevolucion) - new Date(b.fechaLimiteDevolucion));
  }
  
  state.currentPageReservas = 1;
  renderizarTablaReservas();
}

// ============================== //
// 📊 ESTADÍSTICAS
// ============================== //
function renderizarEstadisticasDetalladas() {
  const container = document.getElementById('estadisticasDetalle');
  if (!container) return;
  
  const totalEjemplares = state.libros.reduce((sum, l) => sum + (l.cantidad || 0), 0);
  const promedioEjemplares = (totalEjemplares / state.libros.length).toFixed(2);
  
  const libroMasEjemplares = state.libros.reduce((max, l) => (l.cantidad || 0) > (max.cantidad || 0) ? l : max, state.libros[0] || {});
  
  const categoriasCounts = state.libros.reduce((acc, l) => {
    const cat = l.genero || l.categoria || "Sin categoría";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoriaMasLibros = Object.entries(categoriasCounts).reduce((max, [cat, count]) => 
    count > max.count ? {cat, count} : max, {cat: '', count: 0});
  
  const autoresCounts = state.libros.reduce((acc, l) => {
    acc[l.autor || "Desconocido"] = (acc[l.autor || "Desconocido"] || 0) + 1;
    return acc;
  }, {});
  const autorMasLibros = Object.entries(autoresCounts).reduce((max, [autor, count]) => 
    count > max.count ? {autor, count} : max, {autor: '', count: 0});
  
  const librosSinImagen = state.libros.filter(l => !l.imagen?.trim()).length;
  const librosSinSinopsis = state.libros.filter(l => !l.sinopsis?.trim()).length;
  const tasaDisponibilidad = ((state.libros.filter(l => l.cantidad > 0).length / state.libros.length) * 100).toFixed(1);
  
  const stats = [
    { icon: 'fa-layer-group', label: 'Total de Ejemplares', value: totalEjemplares },
    { icon: 'fa-chart-line', label: 'Promedio de Ejemplares por Libro', value: promedioEjemplares },
    { icon: 'fa-crown', label: 'Libro con Más Ejemplares', value: `${libroMasEjemplares.titulo || 'N/A'} (${libroMasEjemplares.cantidad || 0})` },
    { icon: 'fa-trophy', label: 'Categoría con Más Libros', value: `${categoriaMasLibros.cat} (${categoriaMasLibros.count})` },
    { icon: 'fa-user-edit', label: 'Autor con Más Libros', value: `${autorMasLibros.autor} (${autorMasLibros.count})` },
    { icon: 'fa-image', label: 'Libros sin Portada', value: librosSinImagen, class: librosSinImagen > 0 ? 'text-warning' : 'text-success' },
    { icon: 'fa-align-left', label: 'Libros sin Sinopsis', value: librosSinSinopsis, class: librosSinSinopsis > 0 ? 'text-warning' : 'text-success' },
    { icon: 'fa-percentage', label: 'Tasa de Disponibilidad', value: `${tasaDisponibilidad}%` }
  ];
  
  container.innerHTML = stats.map(s => `
    <div class="stat-detail-item">
      <strong><i class="fas ${s.icon}"></i> ${s.label}</strong>
      <span class="${s.class || ''}">${s.value}</span>
    </div>
  `).join('');
}

// ============================== //
// 📚 CRUD LIBROS
// ============================== //
async function agregarLibro() {
  const { value: formValues } = await Swal.fire({
    title: "📚 Agregar Nuevo Libro",
    html: generarFormularioLibro(),
    showCancelButton: true,
    confirmButtonText: "💾 Guardar",
    cancelButtonText: "❌ Cancelar",
    width: "800px",
    preConfirm: () => validarFormularioLibro()
  });

  if (formValues) {
    try {
      const response = await fetch(`${API_URL}/libros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) throw new Error(await response.text());
      
      await Swal.fire("✅ Libro Agregado", "El libro se ha registrado correctamente", "success");
      await cargarLibros();
      actualizarDashboard();
      renderizarTablaLibros();
    } catch (error) {
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

async function editarLibro(id) {
  try {
    const response = await fetch(`${API_URL}/libros/${id}`);
    if (!response.ok) throw new Error("No se pudo cargar el libro");
    const libro = await response.json();

    const { value: formValues } = await Swal.fire({
      title: "✏️ Editar Libro",
      html: generarFormularioLibro(libro),
      showCancelButton: true,
      confirmButtonText: "💾 Guardar",
      cancelButtonText: "❌ Cancelar",
      width: "800px",
      preConfirm: () => validarFormularioLibro()
    });

    if (formValues) {
      const responseUpdate = await fetch(`${API_URL}/libros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });

      if (!responseUpdate.ok) throw new Error("No se pudo actualizar");
      
      await Swal.fire("✅ Actualizado", "El libro se ha actualizado correctamente", "success");
      await cargarLibros();
      actualizarDashboard();
      renderizarTablaLibros();
    }
  } catch (error) {
    Swal.fire("❌ Error", error.message, "error");
  }
}

async function eliminarLibro(id) {
  const libro = state.libros.find(l => l.id === id);
  if (!libro) return;
  
  const confirmacion = await Swal.fire({
    title: "⚠️ ¿Estás seguro?",
    html: `<p>Se eliminará: <strong>"${libro.titulo}"</strong></p>
           <p style="margin-top: 10px; color: #C0392B;">Esta acción eliminará todas las reservas asociadas</p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#C0392B",
    confirmButtonText: "🗑️ Sí, eliminar",
    cancelButtonText: "❌ Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/libros/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar");
      
      await Swal.fire("✅ Eliminado", "El libro ha sido eliminado", "success");
      await cargarLibros();
      actualizarDashboard();
      renderizarTablaLibros();
    } catch (error) {
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

async function verDetalleLibro(id) {
  const libro = state.libros.find(l => l.id === id);
  if (!libro) return;
  
  Swal.fire({
    title: libro.titulo,
    html: `
      <div style="text-align: left; max-height: 500px; overflow-y: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${libro.imagen || 'https://via.placeholder.com/200x280?text=Sin+Portada'}" 
               style="max-width: 200px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"
               onerror="this.src='https://via.placeholder.com/200x280?text=Sin+Portada'">
        </div>
        <div style="display: grid; gap: 12px;">
          <p><strong>📖 Título:</strong> ${libro.titulo}</p>
          <p><strong>✍️ Autor:</strong> ${libro.autor}</p>
          <p><strong>📚 Categoría:</strong> ${libro.genero || libro.categoria || 'N/A'}</p>
          <p><strong>📊 Cantidad:</strong> ${libro.cantidad || 0} ejemplares</p>
          <p><strong>🏷️ Estado:</strong> 
            <span class="status-badge ${libro.cantidad > 0 ? 'status-disponible' : 'status-agotado'}">
              ${libro.cantidad > 0 ? 'Disponible' : 'Agotado'}
            </span>
          </p>
          ${libro.registro ? `<p><strong>🔖 Registro:</strong> ${libro.registro}</p>` : ''}
          ${libro.signaturaTopografica ? `<p><strong>📍 Signatura:</strong> ${libro.signaturaTopografica}</p>` : ''}
          ${libro.paginas ? `<p><strong>📄 Páginas:</strong> ${libro.paginas}</p>` : ''}
          ${libro.sinopsis ? `<p><strong>📝 Sinopsis:</strong><br>${libro.sinopsis}</p>` : ''}
        </div>
      </div>
    `,
    width: "700px",
    confirmButtonText: "Cerrar",
    showCloseButton: true
  });
}

function generarFormularioLibro(libro = {}) {
  const opcionesCategorias = state.categorias.map(cat => 
    `<option value="${cat}" ${(libro.genero === cat || libro.categoria === cat) ? 'selected' : ''}>${cat}</option>`
  ).join('');

  return `
    <div class="form-container" style="max-height: 500px; overflow-y: auto; text-align: left;">
      <div class="form-section">
        <h3 class="section-title">📖 Información Principal</h3>
        <div class="form-grid">
          <div class="form-field">
            <label>Título *</label>
            <input id="swal-titulo" class="swal2-input" style="margin: 5px 0;" value="${libro.titulo || ''}" placeholder="Título del libro">
          </div>
          <div class="form-field">
            <label>Autor *</label>
            <input id="swal-autor" class="swal2-input" style="margin: 5px 0;" value="${libro.autor || ''}" placeholder="Nombre del autor">
          </div>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>Categoría *</label>
            <select id="swal-categoria" class="swal2-select" style="margin: 5px 0; width: 100%;">
              <option value="">Selecciona...</option>
              ${opcionesCategorias}
            </select>
          </div>
          <div class="form-field">
            <label>Cantidad *</label>
            <input id="swal-cantidad" class="swal2-input" type="number" value="${libro.cantidad || 1}" min="0" style="margin: 5px 0;">
          </div>
        </div>
      </div>

      <div class="form-section" style="margin-top: 15px;">
        <h3 class="section-title">📊 Detalles</h3>
        <div class="form-field">
          <label>Registro</label>
          <input id="swal-registro" class="swal2-input" style="margin: 5px 0;" value="${libro.registro || ''}" placeholder="Código">
        </div>
        <div class="form-field">
          <label>Signatura</label>
          <input id="swal-signatura" class="swal2-input" style="margin: 5px 0;" value="${libro.signaturaTopografica || ''}" placeholder="Ej: 863.6 G216c">
        </div>
        <div class="form-field">
          <label>Páginas</label>
          <input id="swal-paginas" class="swal2-input" type="number" min="1" style="margin: 5px 0;" value="${libro.paginas || ''}">
        </div>
      </div>

      <div class="form-section" style="margin-top: 15px;">
        <h3 class="section-title">🖼️ Multimedia</h3>
        <div class="form-field">
          <label>URL Imagen</label>
          <input id="swal-imagen" class="swal2-input" style="margin: 5px 0;" value="${libro.imagen || ''}" placeholder="https://...">
        </div>
        <div class="form-field">
          <label>Sinopsis</label>
          <textarea id="swal-sinopsis" class="swal2-textarea" style="margin: 5px 0;" placeholder="Descripción...">${libro.sinopsis || ''}</textarea>
        </div>
      </div>
    </div>
  `;
}

function validarFormularioLibro() {
  const titulo = document.getElementById("swal-titulo").value.trim();
  const autor = document.getElementById("swal-autor").value.trim();
  const categoria = document.getElementById("swal-categoria").value.trim();
  const cantidad = parseInt(document.getElementById("swal-cantidad").value) || 0;

  if (!titulo || !autor || !categoria) {
    Swal.showValidationMessage('⚠️ Título, Autor y Categoría son obligatorios');
    return false;
  }

  return {
    titulo,
    autor,
    genero: categoria,
    registro: document.getElementById("swal-registro").value.trim() || null,
    signaturaTopografica: document.getElementById("swal-signatura").value.trim() || null,
    paginas: parseInt(document.getElementById("swal-paginas").value) || null,
    imagen: document.getElementById("swal-imagen").value.trim() || null,
    cantidad,
    sinopsis: document.getElementById("swal-sinopsis").value.trim() || null,
    estado: cantidad > 0 ? "disponible" : "agotado"
  };
}

// ============================== //
// 📋 CRUD RESERVAS
// ============================== //
async function verDetalleReserva(id) {
  const reserva = state.reservas.find(r => r.id === id);
  if (!reserva) return;
  
  const diasInfo = calcularDiasReserva(reserva);
  let diasHTML = '';
  if (diasInfo.class === 'urgente') diasHTML = `<p style="color: #C0392B;"><strong>⚠️ Retraso:</strong> ${diasInfo.text}</p>`;
  else if (diasInfo.class === 'advertencia') diasHTML = `<p style="color: #f39c12;"><strong>⏰ Urgente:</strong> ${diasInfo.text}</p>`;
  else if (diasInfo.class === 'normal') diasHTML = `<p style="color: #28a745;"><strong>✅ Tiempo:</strong> ${diasInfo.text}</p>`;
  
  Swal.fire({
    title: `Reserva #${reserva.id}`,
    html: `
      <div style="text-align: left; max-height: 500px; overflow-y: auto;">
        <div style="display: grid; gap: 15px;">
          <div style="background: rgba(59, 156, 150, 0.1); padding: 15px; border-radius: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #3B9C96;">👤 Usuario</h4>
            <p><strong>Nombre:</strong> ${reserva.usuario?.nombre || 'N/A'}</p>
            <p><strong>Correo:</strong> ${reserva.usuario?.correo || 'N/A'}</p>
          </div>
          
          <div style="background: rgba(74, 144, 226, 0.1); padding: 15px; border-radius: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #4a90e2;">📚 Libro</h4>
            <p><strong>Título:</strong> ${reserva.libro?.titulo || 'N/A'}</p>
            <p><strong>Autor:</strong> ${reserva.libro?.autor || 'N/A'}</p>
          </div>
          
          <div style="background: rgba(243, 156, 18, 0.1); padding: 15px; border-radius: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #f39c12;">📅 Fechas</h4>
            <p><strong>Reserva:</strong> ${reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleString('es-ES') : 'N/A'}</p>
            ${reserva.fechaAprobacion ? `<p><strong>Aprobación:</strong> ${new Date(reserva.fechaAprobacion).toLocaleString('es-ES')}</p>` : ''}
            ${reserva.fechaLimiteDevolucion ? `<p><strong>Límite:</strong> ${new Date(reserva.fechaLimiteDevolucion).toLocaleString('es-ES')}</p>` : ''}
          </div>
          
          <div style="background: rgba(40, 167, 69, 0.1); padding: 15px; border-radius: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #28a745;">📊 Estado</h4>
            <p><strong>Estado:</strong> <span class="badge-${reserva.estado}">${getEstadoIcon(reserva.estado)} ${capitalizeFirst(reserva.estado)}</span></p>
            ${diasHTML}
          </div>
        </div>
      </div>
    `,
    width: "700px",
    confirmButtonText: "Cerrar",
    showCloseButton: true
  });
}

async function aprobarReserva(id) {
  const confirmacion = await Swal.fire({
    title: "✅ Aprobar Reserva",
    text: "¿Confirmas que quieres aprobar esta reserva?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, aprobar",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/reservas/${id}/aprobar`, { method: "PUT" });
      if (!response.ok) throw new Error(await response.text());
      
      await Swal.fire("✅ Aprobada", "La reserva ha sido aprobada", "success");
      await cargarReservas();
      actualizarDashboard();
      renderizarTablaReservas();
    } catch (error) {
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

async function rechazarReserva(id) {
  const confirmacion = await Swal.fire({
    title: "❌ Rechazar Reserva",
    text: "¿Estás seguro de rechazar esta reserva?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#C0392B",
    confirmButtonText: "Sí, rechazar",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/reservas/${id}/rechazar`, { method: "PUT" });
      if (!response.ok) throw new Error("No se pudo rechazar");
      
      await Swal.fire("✅ Rechazada", "La reserva ha sido rechazada", "success");
      await cargarReservas();
      actualizarDashboard();
      renderizarTablaReservas();
    } catch (error) {
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

async function devolverLibro(id) {
  const confirmacion = await Swal.fire({
    title: "📚 Marcar como Devuelto",
    text: "¿El usuario ha devuelto el libro?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, devuelto",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/reservas/${id}/devolver`, { method: "PUT" });
      if (!response.ok) throw new Error(await response.text());
      
      await Swal.fire("✅ Devuelto", "El libro ha sido marcado como devuelto", "success");
      await Promise.all([cargarReservas(), cargarLibros()]);
      actualizarDashboard();
      renderizarTablaReservas();
    } catch (error) {
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

// ============================== //
// 📊 CARGAR SECCIÓN
// ============================== //
function cargarDatosSeccion(seccion) {
  const acciones = {
    libros: renderizarTablaLibros,
    reservas: renderizarTablaReservas,
    categorias: renderizarCategoriasGrid,
    estadisticas: renderizarEstadisticasDetalladas
  };
  acciones[seccion]?.();
}

// ============================== //
// 🎯 EVENT LISTENERS
// ============================== //
function setupEventListeners() {
  // Búsqueda y filtros libros
  document.getElementById('searchLibros')?.addEventListener('input', aplicarFiltros);
  document.getElementById('filterCategoria')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filterEstado')?.addEventListener('change', aplicarFiltros);
  document.getElementById('btnLimpiarFiltros')?.addEventListener('click', () => {
    document.getElementById('searchLibros').value = '';
    document.getElementById('filterCategoria').value = '';
    document.getElementById('filterEstado').value = '';
    aplicarFiltros();
  });
  
  // Búsqueda y filtros reservas
  document.getElementById('searchReservas')?.addEventListener('input', aplicarFiltrosReservas);
  document.getElementById('filterEstadoReserva')?.addEventListener('change', aplicarFiltrosReservas);
  document.getElementById('filterOrdenReserva')?.addEventListener('change', aplicarFiltrosReservas);
  document.getElementById('btnLimpiarFiltrosReservas')?.addEventListener('click', () => {
    document.getElementById('searchReservas').value = '';
    document.getElementById('filterEstadoReserva').value = '';
    document.getElementById('filterOrdenReserva').value = 'recientes';
    aplicarFiltrosReservas();
  });
  
  // Actualizar
  document.getElementById('btnActualizarReservas')?.addEventListener('click', async () => {
    await cargarReservas();
    renderizarTablaReservas();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '✅ Actualizado', showConfirmButton: false, timer: 2000 });
  });
  
  document.getElementById('btnRefresh')?.addEventListener('click', async () => {
    await cargarDatosIniciales();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '✅ Actualizado', showConfirmButton: false, timer: 2000 });
  });
  
  // Agregar libro
  document.getElementById('btnAgregarLibro')?.addEventListener('click', agregarLibro);
}

// ============================== //
// 🛠️ UTILIDADES
// ============================== //
function getEstadoIcon(estado) {
  const iconos = { pendiente: '⏳', aprobada: '✅', rechazada: '❌', vencida: '⚠️', devuelta: '🔄' };
  return iconos[estado] || '📋';
}

function capitalizeFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ============================== //
// 🌐 FUNCIONES GLOBALES
// ============================== //
window.verDetalleLibro = verDetalleLibro;
window.editarLibro = editarLibro;
window.eliminarLibro = eliminarLibro;
window.filtrarPorCategoriaEnTabla = filtrarPorCategoriaEnTabla;
window.cambiarPagina = cambiarPagina;
window.cambiarPaginaReservas = cambiarPaginaReservas;
window.verDetalleReserva = verDetalleReserva;
window.aprobarReserva = aprobarReserva;
window.rechazarReserva = rechazarReserva;
window.devolverLibro = devolverLibro;