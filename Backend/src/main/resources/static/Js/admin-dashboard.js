// ============================== //
// 🌐 CONFIGURACIÓN GLOBAL
// ============================== //
const API_URL = "http://localhost:8080/api";
let librosData = [];
let reservasData = [];
let categorias = [];
let currentPage = 1;
let currentPageReservas = 1;
const itemsPerPage = 10;
let filteredLibros = [];
let filteredReservas = [];

// Charts
let categoriasChart = null;
let estadoChart = null;

// ============================== //
// 🚀 INICIALIZACIÓN
// ============================== //
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 Iniciando Dashboard Administrativo...");
  
  // Verificar autenticación de admin
  verificarAdmin();
  
  // Configurar navegación
  setupNavigation();
  
  // Configurar sidebar toggle
  setupSidebarToggle();
  
  // Cargar datos iniciales
  await cargarDatosIniciales();
  
  // Configurar eventos
  setupEventListeners();
  
  console.log("✅ Dashboard cargado correctamente");
});

// ============================== //
// 🔐 VERIFICAR ADMIN
// ============================== //
function verificarAdmin() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (!usuario || usuario.rol?.toUpperCase() !== "ADMIN") {
    Swal.fire({
      title: "❌ Acceso Denegado",
      text: "Solo los administradores pueden acceder a esta página",
      icon: "error",
      confirmButtonText: "Ir al catálogo"
    }).then(() => {
      window.location.href = "directorio.html";
    });
    return;
  }
  
  // Mostrar nombre del admin
  document.getElementById("adminName").textContent = usuario.nombre || "Admin";
}

// ============================== //
// 🎯 NAVEGACIÓN
// ============================== //
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      cambiarSeccion(section);
    });
  });
}

function cambiarSeccion(seccion) {
  // Actualizar nav items activos
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeNav = document.querySelector(`[data-section="${seccion}"]`);
  if (activeNav) {
    activeNav.classList.add('active');
  }
  
  // Cambiar contenido
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  const activeSection = document.getElementById(`section-${seccion}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }
  
  // Actualizar título
  const titulos = {
    dashboard: "Dashboard General",
    libros: "Gestión de Libros",
    reservas: "Gestión de Reservas",
    categorias: "Categorías",
    estadisticas: "Estadísticas Detalladas"
  };
  
  document.getElementById('pageTitle').textContent = titulos[seccion] || "Dashboard";
  
  // Cargar datos específicos de la sección
  cargarDatosSeccion(seccion);
}

// ============================== //
// 📱 SIDEBAR TOGGLE
// ============================== //
function setupSidebarToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  menuToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
  
  // Cerrar sidebar al hacer clic fuera (solo en móvil)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1200) {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });
}

// ============================== //
// 📊 CARGAR DATOS INICIALES
// ============================== //
async function cargarDatosIniciales() {
  try {
    await Promise.all([
      cargarLibros(),
      cargarCategorias(),
      cargarReservas()
    ]);
    
    actualizarDashboard();
    renderizarCategoriasGrid();
    
  } catch (error) {
    console.error("❌ Error al cargar datos iniciales:", error);
    Swal.fire("❌ Error", "No se pudieron cargar los datos", "error");
  }
}

// ============================== //
// 📚 CARGAR LIBROS
// ============================== //
async function cargarLibros() {
  try {
    const response = await fetch(`${API_URL}/libros`);
    if (!response.ok) throw new Error("Error al cargar libros");
    
    librosData = await response.json();
    filteredLibros = [...librosData];
    
    console.log(`✅ ${librosData.length} libros cargados`);
    return librosData;
    
  } catch (error) {
    console.error("❌ Error al cargar libros:", error);
    throw error;
  }
}

// ============================== //
// 📋 CARGAR RESERVAS
// ============================== //
async function cargarReservas() {
  try {
    const response = await fetch(`${API_URL}/reservas`);
    if (!response.ok) throw new Error("Error al cargar reservas");
    
    reservasData = await response.json();
    filteredReservas = [...reservasData];
    
    console.log(`✅ ${reservasData.length} reservas cargadas`);
    return reservasData;
    
  } catch (error) {
    console.error("❌ Error al cargar reservas:", error);
    throw error;
  }
}

// ============================== //
// 📂 CARGAR CATEGORÍAS
// ============================== //
async function cargarCategorias() {
  try {
    const response = await fetch(`${API_URL}/libros/categorias`);
    if (!response.ok) throw new Error("Error al cargar categorías");
    
    const data = await response.json();
    categorias = data.categorias;
    
    console.log(`✅ ${categorias.length} categorías cargadas`);
    
    // Llenar filtro de categorías
    const filterCategoria = document.getElementById('filterCategoria');
    if (filterCategoria) {
      categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategoria.appendChild(option);
      });
    }
    
    return categorias;
    
  } catch (error) {
    console.error("❌ Error al cargar categorías:", error);
    throw error;
  }
}

// ============================== //
// 📊 ACTUALIZAR DASHBOARD
// ============================== //
function actualizarDashboard() {
  // Calcular estadísticas de libros
  const totalLibros = librosData.length;
  const disponibles = librosData.filter(l => l.cantidad > 0).length;
  const agotados = librosData.filter(l => l.cantidad === 0).length;
  const totalCategorias = categorias.length;
  
  // Calcular estadísticas de reservas
  const totalReservas = reservasData.length;
  const pendientes = reservasData.filter(r => r.estado === 'pendiente').length;
  
  // Actualizar cards
  document.getElementById('totalLibros').textContent = totalLibros;
  document.getElementById('librosDisponibles').textContent = disponibles;
  document.getElementById('librosAgotados').textContent = agotados;
  document.getElementById('totalCategorias').textContent = totalCategorias;
  document.getElementById('totalReservas').textContent = totalReservas;
  document.getElementById('reservasPendientes').textContent = pendientes;
  
  // Actualizar gráficos
  actualizarGraficos();
  
  // Mostrar últimos libros agregados
  mostrarUltimosLibros();
}

// ============================== //
// 📈 ACTUALIZAR GRÁFICOS
// ============================== //
function actualizarGraficos() {
  // Gráfico de categorías
  const categoriasCounts = {};
  librosData.forEach(libro => {
    const cat = libro.genero || libro.categoria || "Sin categoría";
    categoriasCounts[cat] = (categoriasCounts[cat] || 0) + 1;
  });
  
  const ctxCategorias = document.getElementById('categoriasChart');
  if (ctxCategorias) {
    if (categoriasChart) categoriasChart.destroy();
    
    categoriasChart = new Chart(ctxCategorias, {
      type: 'bar',
      data: {
        labels: Object.keys(categoriasCounts),
        datasets: [{
          label: 'Cantidad de Libros',
          data: Object.values(categoriasCounts),
          backgroundColor: 'rgba(59, 156, 150, 0.7)',
          borderColor: '#3B9C96',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#F0EDE5' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#D3D3D3' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#D3D3D3' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  }
  
  // Gráfico de estado
  const disponibles = librosData.filter(l => l.cantidad > 0).length;
  const agotados = librosData.filter(l => l.cantidad === 0).length;
  
  const ctxEstado = document.getElementById('estadoChart');
  if (ctxEstado) {
    if (estadoChart) estadoChart.destroy();
    
    estadoChart = new Chart(ctxEstado, {
      type: 'doughnut',
      data: {
        labels: ['Disponibles', 'Agotados'],
        datasets: [{
          data: [disponibles, agotados],
          backgroundColor: ['#28a745', '#C0392B'],
          borderColor: ['#20803a', '#A93226'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#F0EDE5' }
          }
        }
      }
    });
  }
}

// ============================== //
// 📚 MOSTRAR ÚLTIMOS LIBROS
// ============================== //
function mostrarUltimosLibros() {
  const container = document.getElementById('recentBooksContainer');
  if (!container) return;
  
  const ultimosLibros = librosData.slice(-5).reverse();
  
  if (ultimosLibros.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">No hay libros registrados</p>';
    return;
  }
  
  container.innerHTML = ultimosLibros.map(libro => `
    <div class="book-item">
      <img src="${libro.imagen || 'https://via.placeholder.com/60x85?text=Sin+Portada'}" 
           alt="${libro.titulo}"
           onerror="this.src='https://via.placeholder.com/60x85?text=Sin+Portada'">
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
// 📋 RENDERIZAR TABLA DE LIBROS
// ============================== //
function renderizarTablaLibros() {
  const tbody = document.getElementById('tablaLibros');
  if (!tbody) return;
  
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const librosPaginados = filteredLibros.slice(start, end);
  
  if (librosPaginados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="empty-state">
            <i class="fas fa-book-open"></i>
            <h3>No se encontraron libros</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = librosPaginados.map(libro => `
    <tr>
      <td>
        <img src="${libro.imagen || 'https://via.placeholder.com/50x70?text=Sin+Portada'}" 
             alt="${libro.titulo}"
             class="book-cover"
             onerror="this.src='https://via.placeholder.com/50x70?text=Sin+Portada'">
      </td>
      <td><strong>${libro.titulo}</strong></td>
      <td>${libro.autor}</td>
      <td>${libro.genero || libro.categoria || 'Sin categoría'}</td>
      <td class="text-center"><strong>${libro.cantidad || 0}</strong></td>
      <td>
        <span class="status-badge ${libro.cantidad > 0 ? 'status-disponible' : 'status-agotado'}">
          ${libro.cantidad > 0 ? 'Disponible' : 'Agotado'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="verDetalleLibro(${libro.id})" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon" onclick="editarLibro(${libro.id})" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon danger" onclick="eliminarLibro(${libro.id})" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  renderizarPaginacion();
}

// ============================== //
// 📄 PAGINACIÓN
// ============================== //
function renderizarPaginacion() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  const totalPages = Math.ceil(filteredLibros.length / itemsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Botón anterior
  html += `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} 
            onclick="cambiarPagina(${currentPage - 1})">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // Páginas
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `
        <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                onclick="cambiarPagina(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<span class="page-btn" style="border:none;cursor:default;">...</span>';
    }
  }
  
  // Botón siguiente
  html += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} 
            onclick="cambiarPagina(${currentPage + 1})">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  pagination.innerHTML = html;
}

function cambiarPagina(page) {
  const totalPages = Math.ceil(filteredLibros.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderizarTablaLibros();
  
  // Scroll to top
  document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
}

// ============================== //
// 🎨 RENDERIZAR GRID DE CATEGORÍAS
// ============================== //
function renderizarCategoriasGrid() {
  const grid = document.getElementById('categoriasGrid');
  if (!grid) return;
  
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
  
  grid.innerHTML = categorias.map(cat => {
    const cantidad = librosData.filter(l => (l.genero === cat || l.categoria === cat)).length;
    const icono = iconos[cat] || 'fa-book';
    
    return `
      <div class="category-card" onclick="filtrarPorCategoriaEnTabla('${cat}')">
        <div class="category-icon">
          <i class="fas ${icono}"></i>
        </div>
        <h3>${cat}</h3>
        <p class="category-count">${cantidad}</p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">libros</p>
      </div>
    `;
  }).join('');
}

function filtrarPorCategoriaEnTabla(categoria) {
  cambiarSeccion('libros');
  document.getElementById('filterCategoria').value = categoria;
  aplicarFiltros();
}

// ============================== //
// 🔍 BÚSQUEDA Y FILTROS
// ============================== //
function aplicarFiltros() {
  const searchText = document.getElementById('searchLibros')?.value.toLowerCase() || '';
  const filterCat = document.getElementById('filterCategoria')?.value || '';
  const filterEst = document.getElementById('filterEstado')?.value || '';
  
  filteredLibros = librosData.filter(libro => {
    const matchSearch = libro.titulo.toLowerCase().includes(searchText) ||
                       libro.autor.toLowerCase().includes(searchText) ||
                       (libro.genero || libro.categoria || '').toLowerCase().includes(searchText);
    
    const matchCat = !filterCat || libro.genero === filterCat || libro.categoria === filterCat;
    
    const matchEst = !filterEst || 
                     (filterEst === 'disponible' && libro.cantidad > 0) ||
                     (filterEst === 'agotado' && libro.cantidad === 0);
    
    return matchSearch && matchCat && matchEst;
  });
  
  currentPage = 1;
  renderizarTablaLibros();
}

// ============================== //
// 📊 CARGAR DATOS DE SECCIÓN
// ============================== //
function cargarDatosSeccion(seccion) {
  switch(seccion) {
    case 'libros':
      renderizarTablaLibros();
      break;
    case 'reservas':
      renderizarTablaReservas();
      actualizarStatsReservas();
      break;
    case 'categorias':
      renderizarCategoriasGrid();
      break;
    case 'estadisticas':
      renderizarEstadisticasDetalladas();
      break;
  }
}

// ============================== //
// 📋 RENDERIZAR TABLA DE RESERVAS
// ============================== //
function renderizarTablaReservas() {
  const tbody = document.getElementById('tablaReservas');
  if (!tbody) return;
  
  const start = (currentPageReservas - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const reservasPaginadas = filteredReservas.slice(start, end);
  
  if (reservasPaginadas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">
          <div class="empty-state">
            <i class="fas fa-bookmark"></i>
            <h3>No se encontraron reservas</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = reservasPaginadas.map(reserva => {
    const fechaReserva = reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleDateString('es-ES') : 'N/A';
    const fechaLimite = reserva.fechaLimiteDevolucion ? new Date(reserva.fechaLimiteDevolucion).toLocaleDateString('es-ES') : 'N/A';
    
    // Calcular días
    let diasInfo = '';
    let diasClass = 'neutral';
    
    if (reserva.estado === 'aprobada' && reserva.fechaLimiteDevolucion) {
      const limite = new Date(reserva.fechaLimiteDevolucion);
      const ahora = new Date();
      const diff = Math.ceil((limite - ahora) / (1000 * 60 * 60 * 24));
      
      if (diff < 0) {
        diasInfo = `${Math.abs(diff)} días de retraso`;
        diasClass = 'urgente';
      } else if (diff <= 3) {
        diasInfo = `${diff} días restantes`;
        diasClass = 'advertencia';
      } else {
        diasInfo = `${diff} días restantes`;
        diasClass = 'normal';
      }
    } else if (reserva.estado === 'vencida') {
      diasInfo = 'Vencida';
      diasClass = 'urgente';
    } else if (reserva.estado === 'devuelta') {
      diasInfo = 'Devuelto';
      diasClass = 'neutral';
    } else {
      diasInfo = '-';
    }
    
    // Botones de acción según el estado
    let acciones = '';
    if (reserva.estado === 'pendiente') {
      acciones = `
        <button class="btn-icon success" onclick="aprobarReserva(${reserva.id})" title="Aprobar">
          <i class="fas fa-check"></i>
        </button>
        <button class="btn-icon danger" onclick="rechazarReserva(${reserva.id})" title="Rechazar">
          <i class="fas fa-times"></i>
        </button>
      `;
    } else if (reserva.estado === 'aprobada' || reserva.estado === 'vencida') {
      acciones = `
        <button class="btn-icon warning" onclick="devolverLibro(${reserva.id})" title="Marcar como devuelto">
          <i class="fas fa-undo"></i>
        </button>
      `;
    }
    
    acciones += `
      <button class="btn-icon" onclick="verDetalleReserva(${reserva.id})" title="Ver detalle">
        <i class="fas fa-eye"></i>
      </button>
    `;
    
    return `
      <tr>
        <td><strong>#${reserva.id}</strong></td>
        <td>${reserva.usuario?.nombre || 'Desconocido'}</td>
        <td>${reserva.libro?.titulo || 'Desconocido'}</td>
        <td>${fechaReserva}</td>
        <td>${fechaLimite}</td>
        <td>
          <span class="badge-${reserva.estado}">
            ${getEstadoIcon(reserva.estado)} ${capitalizeFirst(reserva.estado)}
          </span>
        </td>
        <td><span class="dias-info ${diasClass}">${diasInfo}</span></td>
        <td>
          <div class="table-actions">
            ${acciones}
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  renderizarPaginacionReservas();
}

// ============================== //
// 📊 ACTUALIZAR STATS DE RESERVAS
// ============================== //
function actualizarStatsReservas() {
  const pendientes = reservasData.filter(r => r.estado === 'pendiente').length;
  const aprobadas = reservasData.filter(r => r.estado === 'aprobada').length;
  const vencidas = reservasData.filter(r => r.estado === 'vencida').length;
  const devueltas = reservasData.filter(r => r.estado === 'devuelta').length;
  
  document.getElementById('statPendientes').textContent = pendientes;
  document.getElementById('statAprobadas').textContent = aprobadas;
  document.getElementById('statVencidas').textContent = vencidas;
  document.getElementById('statDevueltas').textContent = devueltas;
}

// ============================== //
// 📄 PAGINACIÓN RESERVAS
// ============================== //
function renderizarPaginacionReservas() {
  const pagination = document.getElementById('paginationReservas');
  if (!pagination) return;
  
  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Botón anterior
  html += `
    <button class="page-btn" ${currentPageReservas === 1 ? 'disabled' : ''} 
            onclick="cambiarPaginaReservas(${currentPageReservas - 1})">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // Páginas
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPageReservas - 1 && i <= currentPageReservas + 1)) {
      html += `
        <button class="page-btn ${i === currentPageReservas ? 'active' : ''}" 
                onclick="cambiarPaginaReservas(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPageReservas - 2 || i === currentPageReservas + 2) {
      html += '<span class="page-btn" style="border:none;cursor:default;">...</span>';
    }
  }
  
  // Botón siguiente
  html += `
    <button class="page-btn" ${currentPageReservas === totalPages ? 'disabled' : ''} 
            onclick="cambiarPaginaReservas(${currentPageReservas + 1})">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  pagination.innerHTML = html;
}

function cambiarPaginaReservas(page) {
  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPageReservas = page;
  renderizarTablaReservas();
  
  // Scroll to top
  document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
}

// ============================== //
// 🔍 FILTROS DE RESERVAS
// ============================== //
function aplicarFiltrosReservas() {
  const searchText = document.getElementById('searchReservas')?.value.toLowerCase() || '';
  const filterEst = document.getElementById('filterEstadoReserva')?.value || '';
  const filterOrden = document.getElementById('filterOrdenReserva')?.value || 'recientes';
  
  filteredReservas = reservasData.filter(reserva => {
    const matchSearch = 
      reserva.usuario?.nombre?.toLowerCase().includes(searchText) ||
      reserva.libro?.titulo?.toLowerCase().includes(searchText) ||
      reserva.id?.toString().includes(searchText);
    
    const matchEst = !filterEst || reserva.estado === filterEst;
    
    return matchSearch && matchEst;
  });
  
  // Ordenar
  if (filterOrden === 'recientes') {
    filteredReservas.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
  } else if (filterOrden === 'antiguas') {
    filteredReservas.sort((a, b) => new Date(a.fechaReserva) - new Date(b.fechaReserva));
  } else if (filterOrden === 'proximasVencer') {
    filteredReservas = filteredReservas.filter(r => r.estado === 'aprobada' && r.fechaLimiteDevolucion);
    filteredReservas.sort((a, b) => new Date(a.fechaLimiteDevolucion) - new Date(b.fechaLimiteDevolucion));
  }
  
  currentPageReservas = 1;
  renderizarTablaReservas();
}

// ============================== //
// 👁️ VER DETALLE DE RESERVA
// ============================== //
async function verDetalleReserva(id) {
  const reserva = reservasData.find(r => r.id === id);
  if (!reserva) return;
  
  const fechaReserva = reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleString('es-ES') : 'N/A';
  const fechaAprobacion = reserva.fechaAprobacion ? new Date(reserva.fechaAprobacion).toLocaleString('es-ES') : 'N/A';
  const fechaLimite = reserva.fechaLimiteDevolucion ? new Date(reserva.fechaLimiteDevolucion).toLocaleString('es-ES') : 'N/A';
  
  let diasInfo = '';
  if (reserva.estado === 'aprobada' && reserva.fechaLimiteDevolucion) {
    const limite = new Date(reserva.fechaLimiteDevolucion);
    const ahora = new Date();
    const diff = Math.ceil((limite - ahora) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) {
      diasInfo = `<p style="color: #C0392B;"><strong>⚠️ Retraso:</strong> ${Math.abs(diff)} días</p>`;
    } else if (diff <= 3) {
      diasInfo = `<p style="color: #f39c12;"><strong>⏰ Urgente:</strong> ${diff} días restantes</p>`;
    } else {
      diasInfo = `<p style="color: #28a745;"><strong>✅ Tiempo:</strong> ${diff} días restantes</p>`;
    }
  }
  
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
            <p><strong>Fecha de Reserva:</strong> ${fechaReserva}</p>
            ${reserva.fechaAprobacion ? `<p><strong>Fecha de Aprobación:</strong> ${fechaAprobacion}</p>` : ''}
            ${reserva.fechaLimiteDevolucion ? `<p><strong>Fecha Límite:</strong> ${fechaLimite}</p>` : ''}
          </div>
          
          <div style="background: rgba(40, 167, 69, 0.1); padding: 15px; border-radius: 10px;">
            <h4 style="margin: 0 0 10px 0; color: #28a745;">📊 Estado</h4>
            <p><strong>Estado Actual:</strong> 
              <span class="badge-${reserva.estado}">
                ${getEstadoIcon(reserva.estado)} ${capitalizeFirst(reserva.estado)}
              </span>
            </p>
            ${diasInfo}
          </div>
        </div>
      </div>
    `,
    width: "700px",
    confirmButtonText: "Cerrar",
    showCloseButton: true
  });
}

// ============================== //
// ✅ APROBAR RESERVA
// ============================== //
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
      const response = await fetch(`${API_URL}/reservas/${id}/aprobar`, {
        method: "PUT"
      });

      if (response.ok) {
        await Swal.fire("✅ Aprobada", "La reserva ha sido aprobada correctamente", "success");
        await cargarReservas();
        actualizarDashboard();
        renderizarTablaReservas();
        actualizarStatsReservas();
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

// ============================== //
// ❌ RECHAZAR RESERVA
// ============================== //
async function rechazarReserva(id) {
  const confirmacion = await Swal.fire({
    title: "❌ Rechazar Reserva",
    text: "¿Estás seguro de que quieres rechazar esta reserva?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#C0392B",
    confirmButtonText: "Sí, rechazar",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/reservas/${id}/rechazar`, {
        method: "PUT"
      });

      if (response.ok) {
        await Swal.fire("✅ Rechazada", "La reserva ha sido rechazada", "success");
        await cargarReservas();
        actualizarDashboard();
        renderizarTablaReservas();
        actualizarStatsReservas();
      } else {
        throw new Error("No se pudo rechazar la reserva");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

// ============================== //
// 🔄 DEVOLVER LIBRO
// ============================== //
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
      const response = await fetch(`${API_URL}/reservas/${id}/devolver`, {
        method: "PUT"
      });

      if (response.ok) {
        await Swal.fire("✅ Devuelto", "El libro ha sido marcado como devuelto", "success");
        await cargarReservas();
        await cargarLibros();
        actualizarDashboard();
        renderizarTablaReservas();
        actualizarStatsReservas();
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

// ============================== //
// 📊 ESTADÍSTICAS DETALLADAS
// ============================== //
function renderizarEstadisticasDetalladas() {
  const container = document.getElementById('estadisticasDetalle');
  if (!container) return;
  
  // Calcular estadísticas avanzadas
  const totalLibros = librosData.length;
  const totalEjemplares = librosData.reduce((sum, l) => sum + (l.cantidad || 0), 0);
  const promedioEjemplares = (totalEjemplares / totalLibros).toFixed(2);
  
  // Libros con más ejemplares
  const libroMasEjemplares = librosData.reduce((max, l) => 
    (l.cantidad || 0) > (max.cantidad || 0) ? l : max, librosData[0] || {});
  
  // Categoría con más libros
  const categoriasCounts = {};
  librosData.forEach(libro => {
    const cat = libro.genero || libro.categoria || "Sin categoría";
    categoriasCounts[cat] = (categoriasCounts[cat] || 0) + 1;
  });
  
  const categoriaMasLibros = Object.entries(categoriasCounts)
    .reduce((max, [cat, count]) => count > max.count ? {cat, count} : max, {cat: '', count: 0});
  
  // Autor con más libros
  const autoresCounts = {};
  librosData.forEach(libro => {
    const autor = libro.autor || "Desconocido";
    autoresCounts[autor] = (autoresCounts[autor] || 0) + 1;
  });
  
  const autorMasLibros = Object.entries(autoresCounts)
    .reduce((max, [autor, count]) => count > max.count ? {autor, count} : max, {autor: '', count: 0});
  
  // Libros sin imagen
  const librosSinImagen = librosData.filter(l => !l.imagen || l.imagen.trim() === '').length;
  
  // Libros sin sinopsis
  const librosSinSinopsis = librosData.filter(l => !l.sinopsis || l.sinopsis.trim() === '').length;
  
  container.innerHTML = `
    <div class="stat-detail-item">
      <strong><i class="fas fa-layer-group"></i> Total de Ejemplares</strong>
      <span>${totalEjemplares}</span>
    </div>
    
    <div class="stat-detail-item">
      <strong><i class="fas fa-chart-line"></i> Promedio de Ejemplares por Libro</strong>
      <span>${promedioEjemplares}</span>
    </div>
    
    <div class="stat-detail-item">
      <strong><i class="fas fa-crown"></i> Libro con Más Ejemplares</strong>
      <span>${libroMasEjemplares.titulo || 'N/A'} (${libroMasEjemplares.cantidad || 0})</span>
    </div>
    
    <div class="stat-detail-item">
      <strong><i class="fas fa-trophy"></i> Categoría con Más Libros</strong>
      <span>${categoriaMasLibros.cat} (${categoriaMasLibros.count})</span>
    </div>
    
    <div class="stat-detail-item">
      <strong><i class="fas fa-user-edit"></i> Autor con Más Libros</strong>
      <span>${autorMasLibros.autor} (${autorMasLibros.count})</span>
    </div>
    
    <div class="stat-detail-item">
      <strong><i class="fas fa-image"></i> Libros sin Portada</strong>
      <span class="${librosSinImagen > 0 ? 'text-warning' : 'text-success'}">${librosSinImagen}</span>
    </div>
    
    <div class="stat-detail-item">
      <strong><i class="fas fa-align-left"></i> Libros sin Sinopsis</strong>
      <span class="${librosSinSinopsis > 0 ? 'text-warning' : 'text-success'}">${librosSinSinopsis}</span>
    </div>
    
    <div class="stat-detail-item">
      <strong><i class="fas fa-percentage"></i> Tasa de Disponibilidad</strong>
      <span>${((librosData.filter(l => l.cantidad > 0).length / totalLibros) * 100).toFixed(1)}%</span>
    </div>
  `;
}

// ============================== //
// ➕ AGREGAR LIBRO
// ============================== //
async function agregarLibro() {
  const opcionesCategorias = categorias.map(cat => 
    `<option value="${cat}">${cat}</option>`
  ).join('');

  const { value: formValues } = await Swal.fire({
    title: "📚 Agregar Nuevo Libro",
    html: `
      <div class="form-container" style="max-height: 500px; overflow-y: auto; text-align: left;">
        <div class="form-section">
          <h3 class="section-title">📖 Información Principal</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>Título *</label>
              <input id="swal-titulo" class="swal2-input" style="margin: 5px 0;" placeholder="Ej: Cien años de soledad">
            </div>
            <div class="form-field">
              <label>Autor *</label>
              <input id="swal-autor" class="swal2-input" style="margin: 5px 0;" placeholder="Ej: Gabriel García Márquez">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Categoría *</label>
              <select id="swal-categoria" class="swal2-select" style="margin: 5px 0; width: 100%;">
                <option value="">Selecciona una categoría...</option>
                ${opcionesCategorias}
              </select>
            </div>
            <div class="form-field">
              <label>Cantidad *</label>
              <input id="swal-cantidad" class="swal2-input" type="number" value="1" min="0" style="margin: 5px 0;">
            </div>
          </div>
        </div>

        <div class="form-section" style="margin-top: 15px;">
          <h3 class="section-title">📊 Detalles Adicionales</h3>
          <div class="form-field">
            <label>Registro</label>
            <input id="swal-registro" class="swal2-input" style="margin: 5px 0;" placeholder="Código de registro">
          </div>
          <div class="form-field">
            <label>Signatura Topográfica</label>
            <input id="swal-signatura" class="swal2-input" style="margin: 5px 0;" placeholder="Ej: 863.6 G216c">
          </div>
          <div class="form-field">
            <label>Páginas</label>
            <input id="swal-paginas" class="swal2-input" type="number" min="1" style="margin: 5px 0;">
          </div>
        </div>

        <div class="form-section" style="margin-top: 15px;">
          <h3 class="section-title">🖼️ Multimedia</h3>
          <div class="form-field">
            <label>URL de la Imagen</label>
            <input id="swal-imagen" class="swal2-input" style="margin: 5px 0;" placeholder="https://ejemplo.com/portada.jpg">
          </div>
          <div class="form-field">
            <label>Sinopsis</label>
            <textarea id="swal-sinopsis" class="swal2-textarea" style="margin: 5px 0;" placeholder="Descripción del libro..."></textarea>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "💾 Guardar Libro",
    cancelButtonText: "❌ Cancelar",
    width: "800px",
    preConfirm: () => {
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
        cantidad: cantidad,
        sinopsis: document.getElementById("swal-sinopsis").value.trim() || null,
        estado: cantidad > 0 ? "disponible" : "agotado"
      };
    }
  });

  if (formValues) {
    try {
      const response = await fetch(`${API_URL}/libros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      await Swal.fire("✅ Libro Agregado", "El libro se ha registrado correctamente", "success");
      await cargarLibros();
      actualizarDashboard();
      renderizarTablaLibros();
      
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

// ============================== //
// 👁️ VER DETALLE DE LIBRO
// ============================== //
async function verDetalleLibro(id) {
  const libro = librosData.find(l => l.id === id);
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

// ============================== //
// ✏️ EDITAR LIBRO
// ============================== //
async function editarLibro(id) {
  try {
    const response = await fetch(`${API_URL}/libros/${id}`);
    if (!response.ok) throw new Error("No se pudo cargar el libro");

    const libro = await response.json();
    const opcionesCategorias = categorias.map(cat => 
      `<option value="${cat}" ${(libro.genero === cat || libro.categoria === cat) ? 'selected' : ''}>${cat}</option>`
    ).join('');

    const resultado = await Swal.fire({
      title: "✏️ Editar Libro",
      html: `
        <div class="form-container" style="max-height: 500px; overflow-y: auto; text-align: left;">
          <div class="form-section">
            <div class="form-grid">
              <div class="form-field">
                <label>Título *</label>
                <input id="swal-titulo" class="swal2-input" value="${libro.titulo || ''}" style="margin: 5px 0;">
              </div>
              <div class="form-field">
                <label>Autor *</label>
                <input id="swal-autor" class="swal2-input" value="${libro.autor || ''}" style="margin: 5px 0;">
              </div>
            </div>
            <div class="form-grid">
              <div class="form-field">
                <label>Categoría *</label>
                <select id="swal-categoria" class="swal2-select" style="margin: 5px 0; width: 100%;">
                  ${opcionesCategorias}
                </select>
              </div>
              <div class="form-field">
                <label>Cantidad</label>
                <input id="swal-cantidad" class="swal2-input" type="number" value="${libro.cantidad || 0}" min="0" style="margin: 5px 0;">
              </div>
            </div>
          </div>
          
          <div class="form-section" style="margin-top: 15px;">
            <div class="form-field">
              <label>Registro</label>
              <input id="swal-registro" class="swal2-input" value="${libro.registro || ''}" style="margin: 5px 0;">
            </div>
            <div class="form-field">
              <label>Signatura</label>
              <input id="swal-signatura" class="swal2-input" value="${libro.signaturaTopografica || ''}" style="margin: 5px 0;">
            </div>
            <div class="form-field">
              <label>Páginas</label>
              <input id="swal-paginas" class="swal2-input" type="number" value="${libro.paginas || ''}" style="margin: 5px 0;">
            </div>
            <div class="form-field">
              <label>Imagen URL</label>
              <input id="swal-imagen" class="swal2-input" value="${libro.imagen || ''}" style="margin: 5px 0;">
            </div>
            <div class="form-field">
              <label>Sinopsis</label>
              <textarea id="swal-sinopsis" class="swal2-textarea" style="margin: 5px 0;">${libro.sinopsis || ''}</textarea>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "💾 Guardar Cambios",
      cancelButtonText: "❌ Cancelar",
      width: "800px",
      preConfirm: () => {
        const titulo = document.getElementById("swal-titulo").value.trim();
        const autor = document.getElementById("swal-autor").value.trim();
        const categoria = document.getElementById("swal-categoria").value.trim();

        if (!titulo || !autor || !categoria) {
          Swal.showValidationMessage('⚠️ Título, Autor y Categoría son obligatorios');
          return false;
        }

        return {
          titulo,
          autor,
          genero: categoria,
          cantidad: parseInt(document.getElementById("swal-cantidad").value) || 0,
          registro: document.getElementById("swal-registro").value.trim() || null,
          signaturaTopografica: document.getElementById("swal-signatura").value.trim() || null,
          paginas: parseInt(document.getElementById("swal-paginas").value) || null,
          imagen: document.getElementById("swal-imagen").value.trim() || null,
          sinopsis: document.getElementById("swal-sinopsis").value.trim() || null
        };
      }
    });

    if (resultado.isConfirmed) {
      const responseUpdate = await fetch(`${API_URL}/libros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultado.value)
      });

      if (responseUpdate.ok) {
        await Swal.fire("✅ Actualizado", "El libro se ha actualizado correctamente", "success");
        await cargarLibros();
        actualizarDashboard();
        renderizarTablaLibros();
      } else {
        throw new Error("No se pudo actualizar el libro");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    Swal.fire("❌ Error", error.message, "error");
  }
}

// ============================== //
// 🗑️ ELIMINAR LIBRO
// ============================== //
async function eliminarLibro(id) {
  const libro = librosData.find(l => l.id === id);
  if (!libro) return;
  
  const confirmacion = await Swal.fire({
    title: "⚠️ ¿Estás seguro?",
    html: `
      <p>Se eliminará el libro:</p>
      <strong>"${libro.titulo}"</strong>
      <p style="margin-top: 10px; color: #C0392B;">Esta acción también eliminará todas las reservas asociadas</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#C0392B",
    confirmButtonText: "🗑️ Sí, eliminar",
    cancelButtonText: "❌ Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/libros/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await Swal.fire("✅ Eliminado", "El libro ha sido eliminado correctamente", "success");
        await cargarLibros();
        actualizarDashboard();
        renderizarTablaLibros();
      } else {
        throw new Error("No se pudo eliminar el libro");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire("❌ Error", error.message, "error");
    }
  }
}

// ============================== //
// 🎯 EVENT LISTENERS
// ============================== //
function setupEventListeners() {
  // Búsqueda libros
  document.getElementById('searchLibros')?.addEventListener('input', aplicarFiltros);
  
  // Filtros libros
  document.getElementById('filterCategoria')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filterEstado')?.addEventListener('change', aplicarFiltros);
  
  // Limpiar filtros libros
  document.getElementById('btnLimpiarFiltros')?.addEventListener('click', () => {
    document.getElementById('searchLibros').value = '';
    document.getElementById('filterCategoria').value = '';
    document.getElementById('filterEstado').value = '';
    aplicarFiltros();
  });
  
  // Búsqueda reservas
  document.getElementById('searchReservas')?.addEventListener('input', aplicarFiltrosReservas);
  
  // Filtros reservas
  document.getElementById('filterEstadoReserva')?.addEventListener('change', aplicarFiltrosReservas);
  document.getElementById('filterOrdenReserva')?.addEventListener('change', aplicarFiltrosReservas);
  
  // Limpiar filtros reservas
  document.getElementById('btnLimpiarFiltrosReservas')?.addEventListener('click', () => {
    document.getElementById('searchReservas').value = '';
    document.getElementById('filterEstadoReserva').value = '';
    document.getElementById('filterOrdenReserva').value = 'recientes';
    aplicarFiltrosReservas();
  });
  
  // Actualizar reservas
  document.getElementById('btnActualizarReservas')?.addEventListener('click', async () => {
    await cargarReservas();
    renderizarTablaReservas();
    actualizarStatsReservas();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: '✅ Reservas actualizadas',
      showConfirmButton: false,
      timer: 2000
    });
  });
  
  // Refresh general
  document.getElementById('btnRefresh')?.addEventListener('click', async () => {
    await cargarDatosIniciales();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: '✅ Datos actualizados',
      showConfirmButton: false,
      timer: 2000
    });
  });
  
  // Agregar libro
  document.getElementById('btnAgregarLibro')?.addEventListener('click', agregarLibro);
}

// ============================== //
// 🛠️ UTILIDADES
// ============================== //
function getEstadoIcon(estado) {
  const iconos = {
    'pendiente': '⏳',
    'aprobada': '✅',
    'rechazada': '❌',
    'vencida': '⚠️',
    'devuelta': '🔄'
  };
  return iconos[estado] || '📋';
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================== //
// 🌐 HACER FUNCIONES GLOBALES
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