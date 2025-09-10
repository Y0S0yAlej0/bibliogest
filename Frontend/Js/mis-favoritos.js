document.addEventListener("DOMContentLoaded", function () {
    // === ELEMENTOS DEL DOM === //
    const favoritosGrid = document.getElementById("favoritos-grid");
    const noFavoritos = document.getElementById("no-favoritos");
    const contadorTotal = document.getElementById("contador-total");
    const contadorTodos = document.getElementById("contador-todos");
    const contadorDisponibles = document.getElementById("contador-disponibles");
    const contadorAgotados = document.getElementById("contador-agotados");
    const filtroBuscar = document.getElementById("filtro-buscar");
    const filtrosBotones = document.querySelectorAll(".filtro-btn");
    const btnLimpiarFavoritos = document.getElementById("btn-limpiar-favoritos");
    const btnExportarFavoritos = document.getElementById("btn-exportar-favoritos");
    const btnCompartirFavoritos = document.getElementById("btn-compartir-favoritos");

    // === DATOS === //
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    let favoritos = [];
    let librosData = [];
    let filtroActual = "todos";

    // === INICIALIZACIÓN === //
    init();

    async function init() {
        if (!usuario) {
            Swal.fire({
                title: "⚠️ Acceso denegado",
                text: "Debes iniciar sesión para ver tus favoritos",
                icon: "warning",
                confirmButtonText: "Ir al login"
            }).then(() => {
                window.location.href = "login.html";
            });
            return;
        }

        await cargarLibros();
        cargarFavoritos();
        configurarEventos();
    }

    // === CARGAR DATOS === //
    async function cargarLibros() {
        try {
            const response = await fetch("http://localhost:8080/api/libros");
            if (response.ok) {
                librosData = await response.json();
                console.log("📚 Libros cargados:", librosData.length);
            }
        } catch (error) {
            console.error("❌ Error al cargar libros:", error);
        }
    }

    function cargarFavoritos() {
        const favoritosGuardados = localStorage.getItem(`favoritos_${usuario.id}`);
        favoritos = favoritosGuardados ? JSON.parse(favoritosGuardados) : [];
        console.log("❤️ Favoritos cargados:", favoritos.length);
        
        actualizarContadores();
        renderizarFavoritos();
    }

    function guardarFavoritos() {
        localStorage.setItem(`favoritos_${usuario.id}`, JSON.stringify(favoritos));
        console.log("💾 Favoritos guardados");
    }

    // === RENDERIZADO === //
    function renderizarFavoritos() {
        if (!favoritosGrid || !noFavoritos) return;

        // Obtener favoritos con información completa de libros
        const favoritosCompletos = favoritos.map(fav => {
            const libro = librosData.find(l => l.id === fav.libroId);
            return libro ? { ...fav, ...libro } : null;
        }).filter(Boolean);

        // Aplicar filtros
        const favoritosFiltrados = aplicarFiltros(favoritosCompletos);

        if (favoritosFiltrados.length === 0) {
            mostrarMensajeSinFavoritos();
            return;
        }

        favoritosGrid.innerHTML = "";
        noFavoritos.style.display = "none";

        favoritosFiltrados.forEach((favorito, index) => {
            const card = crearTarjetaFavorito(favorito, index);
            favoritosGrid.appendChild(card);
        });
    }

    function crearTarjetaFavorito(favorito, index) {
        const disponible = favorito.cantidad > 0;
        const fechaAgregado = new Date(favorito.fechaAgregado).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const card = document.createElement("div");
        card.className = `favorito-card ${disponible ? 'disponible' : 'agotado'}`;
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="favorito-header">
                <div class="libro-info">
                    <h3>${favorito.titulo}</h3>
                    <p class="autor">${favorito.autor}</p>
                    <p class="categoria"><i class="fas fa-tag"></i> ${favorito.categoria || favorito.genero || 'Sin categoría'}</p>
                </div>
                <div class="estado-disponibilidad ${disponible ? 'estado-disponible' : 'estado-agotado'}">
                    <i class="fas ${disponible ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                    ${disponible ? `${favorito.cantidad} disponibles` : 'Agotado'}
                </div>
            </div>

            <img src="${favorito.imagen || favorito.imagenUrl || 'ruta/por_defecto.jpg'}" 
                 alt="Portada de ${favorito.titulo}" 
                 class="imagen-libro"
                 onerror="this.src='ruta/por_defecto.jpg'">

            <div class="favorito-info">
                <div class="info-item">
                    <span class="info-label">Registro:</span>
                    <span>${favorito.registro || favorito.isbn || 'N/A'}</span>
                </div>
                ${favorito.paginas ? `
                <div class="info-item">
                    <span class="info-label">Páginas:</span>
                    <span>${favorito.paginas}</span>
                </div>
                ` : ''}
                ${favorito.signaturaTopografica ? `
                <div class="info-item">
                    <span class="info-label">Signatura:</span>
                    <span>${favorito.signaturaTopografica}</span>
                </div>
                ` : ''}
            </div>

            <div class="fecha-agregado">
                <i class="fas fa-heart"></i>
                Agregado a favoritos el ${fechaAgregado}
            </div>

            <div class="favorito-acciones">
                <button class="btn-accion btn-reservar" 
                        data-libro-id="${favorito.id}" 
                        ${!disponible ? 'disabled' : ''}>
                    <i class="fas fa-calendar-plus"></i>
                    ${disponible ? 'Reservar' : 'Agotado'}
                </button>
                <button class="btn-accion btn-quitar-favorito" 
                        data-libro-id="${favorito.id}"
                        title="Quitar de favoritos">
                    <i class="fas fa-heart-broken"></i>
                </button>
            </div>
        `;

        return card;
    }

    function mostrarMensajeSinFavoritos() {
        if (favoritos.length === 0) {
            favoritosGrid.innerHTML = "";
            noFavoritos.style.display = "block";
        } else {
            // Hay favoritos pero no coinciden con el filtro
            favoritosGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #b0b3b8;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.7;"></i>
                    <h3 style="color: #ffffff; margin-bottom: 0.5rem;">No se encontraron favoritos</h3>
                    <p>No hay favoritos que coincidan con los filtros aplicados.</p>
                </div>
            `;
            noFavoritos.style.display = "none";
        }
    }

    // === FILTROS === //
    function aplicarFiltros(favoritos) {
        let resultado = [...favoritos];

        // Filtro por disponibilidad
        if (filtroActual === "disponible") {
            resultado = resultado.filter(fav => fav.cantidad > 0);
        } else if (filtroActual === "agotado") {
            resultado = resultado.filter(fav => fav.cantidad <= 0);
        }

        // Filtro por búsqueda
        const textoBusqueda = filtroBuscar.value.toLowerCase().trim();
        if (textoBusqueda) {
            resultado = resultado.filter(fav => 
                fav.titulo.toLowerCase().includes(textoBusqueda) ||
                fav.autor.toLowerCase().includes(textoBusqueda) ||
                (fav.categoria && fav.categoria.toLowerCase().includes(textoBusqueda)) ||
                (fav.genero && fav.genero.toLowerCase().includes(textoBusqueda))
            );
        }

        return resultado;
    }

    function actualizarContadores() {
        const total = favoritos.length;
        const favoritosCompletos = favoritos.map(fav => {
            const libro = librosData.find(l => l.id === fav.libroId);
            return libro ? { ...fav, ...libro } : null;
        }).filter(Boolean);

        const disponibles = favoritosCompletos.filter(fav => fav.cantidad > 0).length;
        const agotados = favoritosCompletos.filter(fav => fav.cantidad <= 0).length;

        if (contadorTotal) contadorTotal.textContent = total;
        if (contadorTodos) contadorTodos.textContent = total;
        if (contadorDisponibles) contadorDisponibles.textContent = disponibles;
        if (contadorAgotados) contadorAgotados.textContent = agotados;
    }

    // === EVENTOS === //
    function configurarEventos() {
        // Filtros de botones
        filtrosBotones.forEach(btn => {
            btn.addEventListener("click", () => {
                filtrosBotones.forEach(b => b.classList.remove("activo"));
                btn.classList.add("activo");
                filtroActual = btn.dataset.categoria;
                renderizarFavoritos();
            });
        });

        // Filtro de búsqueda
        if (filtroBuscar) {
            filtroBuscar.addEventListener("input", () => {
                renderizarFavoritos();
            });
        }

        // Eventos de favoritos (delegación de eventos)
        if (favoritosGrid) {
            favoritosGrid.addEventListener("click", async (e) => {
                const btnReservar = e.target.closest(".btn-reservar");
                const btnQuitar = e.target.closest(".btn-quitar-favorito");

                if (btnReservar && !btnReservar.disabled) {
                    await reservarLibro(btnReservar.dataset.libroId);
                } else if (btnQuitar) {
                    await quitarDeFavoritos(btnQuitar.dataset.libroId);
                }
            });
        }

        // Acciones rápidas
        if (btnLimpiarFavoritos) {
            btnLimpiarFavoritos.addEventListener("click", limpiarFavoritos);
        }

        if (btnExportarFavoritos) {
            btnExportarFavoritos.addEventListener("click", exportarFavoritos);
        }

        if (btnCompartirFavoritos) {
            btnCompartirFavoritos.addEventListener("click", compartirFavoritos);
        }
    }

    // === ACCIONES === //
    async function reservarLibro(libroId) {
        if (!usuario || !usuario.id) {
            Swal.fire("⚠️ Error", "Debes iniciar sesión para reservar", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/reservas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    libroId: parseInt(libroId),
                    usuarioId: usuario.id
                })
            });

            if (response.ok) {
                Swal.fire({
                    title: "✅ Reserva creada",
                    text: "Tu solicitud está pendiente de aprobación.",
                    icon: "success",
                    showCancelButton: true,
                    confirmButtonText: "Ver mis reservas",
                    cancelButtonText: "Continuar aquí"
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "mis-reservas.html";
                    }
                });
                await cargarLibros(); // Actualizar disponibilidad
                renderizarFavoritos();
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
            console.error("❌ Error al reservar:", error);
            Swal.fire("❌ Error", "Hubo un problema al crear la reserva", "error");
        }
    }

    async function quitarDeFavoritos(libroId) {
        const libro = librosData.find(l => l.id == libroId);
        const tituloLibro = libro ? libro.titulo : "este libro";

        const resultado = await Swal.fire({
            title: "💔 ¿Quitar de favoritos?",
            text: `¿Estás seguro de que quieres quitar "${tituloLibro}" de tus favoritos?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, quitar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#e74c3c",
            background: "#1a1a2e",
            color: "#e4e6ea"
        });

        if (resultado.isConfirmed) {
            favoritos = favoritos.filter(fav => fav.libroId != libroId);
            guardarFavoritos();
            actualizarContadores();
            renderizarFavoritos();

            Swal.fire({
                title: "💔 Quitado de favoritos",
                text: "El libro fue removido de tu lista de favoritos",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        }
    }

    async function limpiarFavoritos() {
        if (favoritos.length === 0) {
            Swal.fire("ℹ️ Información", "No tienes favoritos para limpiar", "info");
            return;
        }

        const resultado = await Swal.fire({
            title: "🗑️ ¿Limpiar todos los favoritos?",
            text: `Se eliminarán ${favoritos.length} libros de tu lista de favoritos. Esta acción no se puede deshacer.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, limpiar todo",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#e74c3c",
            background: "#1a1a2e",
            color: "#e4e6ea"
        });

        if (resultado.isConfirmed) {
            favoritos = [];
            guardarFavoritos();
            actualizarContadores();
            renderizarFavoritos();

            Swal.fire({
                title: "🗑️ Favoritos limpiados",
                text: "Todos los favoritos han sido eliminados",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        }
    }

    function exportarFavoritos() {
        if (favoritos.length === 0) {
            Swal.fire("ℹ️ Información", "No tienes favoritos para exportar", "info");
            return;
        }

        const favoritosCompletos = favoritos.map(fav => {
            const libro = librosData.find(l => l.id === fav.libroId);
            return libro ? {
                titulo: libro.titulo,
                autor: libro.autor,
                categoria: libro.categoria || libro.genero,
                registro: libro.registro || libro.isbn,
                disponible: libro.cantidad > 0,
                fechaAgregado: new Date(fav.fechaAgregado).toLocaleDateString('es-ES')
            } : null;
        }).filter(Boolean);

        // Crear contenido del archivo
        const contenido = `Mi Lista de Favoritos - Biblioteca Digital
Exportado el: ${new Date().toLocaleDateString('es-ES')}
Total de libros: ${favoritosCompletos.length}

${'='.repeat(60)}

${favoritosCompletos.map((libro, index) => `
${index + 1}. ${libro.titulo}
   Autor: ${libro.autor}
   Categoría: ${libro.categoria || 'Sin categoría'}
   Registro: ${libro.registro || 'N/A'}
   Estado: ${libro.disponible ? 'Disponible' : 'Agotado'}
   Agregado: ${libro.fechaAgregado}
`).join('\n')}

${'='.repeat(60)}
Generado por Biblioteca Digital`;

        // Descargar archivo
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mis-favoritos-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Swal.fire({
            title: "📥 Lista exportada",
            text: "Tu lista de favoritos se ha descargado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
    }

    function compartirFavoritos() {
        if (favoritos.length === 0) {
            Swal.fire("ℹ️ Información", "No tienes favoritos para compartir", "info");
            return;
        }

        const favoritosTexto = favoritos.map(fav => {
            const libro = librosData.find(l => l.id === fav.libroId);
            return libro ? `📚 ${libro.titulo} - ${libro.autor}` : null;
        }).filter(Boolean).join('\n');

        const textoCompleto = `🎯 Mi Lista de Favoritos (${favoritos.length} libros):

${favoritosTexto}

📖 Biblioteca Digital`;

        if (navigator.share) {
            navigator.share({
                title: 'Mi Lista de Favoritos',
                text: textoCompleto
            }).then(() => {
                console.log('✅ Compartido exitosamente');
            }).catch((error) => {
                console.log('❌ Error al compartir:', error);
                copiarAlPortapapeles(textoCompleto);
            });
        } else {
            copiarAlPortapapeles(textoCompleto);
        }
    }

    function copiarAlPortapapeles(texto) {
        navigator.clipboard.writeText(texto).then(() => {
            Swal.fire({
                title: "📋 Copiado",
                text: "Tu lista de favoritos se copió al portapapeles",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        }).catch(() => {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = texto;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            Swal.fire({
                title: "📋 Copiado",
                text: "Tu lista de favoritos se copió al portapapeles",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    // === FUNCIÓN GLOBAL PARA AGREGAR FAVORITOS === //
    window.toggleFavorito = function(libroId) {
        if (!usuario || !usuario.id) {
            Swal.fire("⚠️ Error", "Debes iniciar sesión para agregar favoritos", "warning");
            return false;
        }

        const yaEsFavorito = favoritos.some(fav => fav.libroId === libroId);
        
        if (yaEsFavorito) {
            // Quitar de favoritos
            favoritos = favoritos.filter(fav => fav.libroId !== libroId);
            guardarFavoritos();
            
            Swal.fire({
                title: "💔 Quitado de favoritos",
                text: "El libro fue removido de tus favoritos",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            
            return false; // No es favorito ahora
        } else {
            // Agregar a favoritos
            favoritos.push({
                libroId: parseInt(libroId),
                fechaAgregado: new Date().toISOString()
            });
            guardarFavoritos();
            
            Swal.fire({
                title: "❤️ Agregado a favoritos",
                text: "El libro se agregó a tu lista de favoritos",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: "Ver favoritos",
                cancelButtonColor: "#ff6b9d"
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = "mis-favoritos.html";
                }
            });
            
            return true; // Es favorito ahora
        }
    };

    // === FUNCIÓN GLOBAL PARA VERIFICAR FAVORITOS === //
    window.esFavorito = function(libroId) {
        return favoritos.some(fav => fav.libroId === libroId);
    };

    // === FUNCIÓN GLOBAL PARA OBTENER CONTADOR === //
    window.getContadorFavoritos = function() {
        return favoritos.length;
    };
});