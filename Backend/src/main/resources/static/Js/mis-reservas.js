document.addEventListener("DOMContentLoaded", function () {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (!usuario || !usuario.id) {
    Swal.fire({
      icon: "warning",
      title: "Acceso denegado",
      text: "Debes iniciar sesión para ver tus reservas.",
      background: "#1e1e1e",
      color: "#fff",
      confirmButtonColor: "#3085d6"
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  const reservasContainer = document.getElementById("reservas-container");
  const alertasContainer = document.getElementById("alertas-container");
  const noReservasDiv = document.getElementById("no-reservas");
  const filtrosBotones = document.querySelectorAll(".filtro-btn");

  let todasLasReservas = [];
  let estadoActivo = "todas";

  // Cargar reservas al iniciar
  cargarReservas();

  // Manejar clicks en botones de filtro
  filtrosBotones.forEach(boton => {
    boton.addEventListener("click", () => {
      const estado = boton.dataset.estado;
      
      // Remover clase activo de todos los botones
      filtrosBotones.forEach(b => b.classList.remove("activo"));
      
      // Agregar clase activo al botón clickeado
      boton.classList.add("activo");
      
      // Filtrar reservas
      estadoActivo = estado;
      filtrarReservas();
    });
  });

  async function cargarReservas() {
    try {
      const response = await fetch(`http://localhost:8080/api/reservas/usuario/${usuario.id}`);
      
      if (!response.ok) {
        throw new Error("No se pudieron cargar las reservas");
      }

      todasLasReservas = await response.json();
      
      // Mostrar alertas importantes
      mostrarAlertas(todasLasReservas);
      
      // Mostrar reservas
      mostrarReservas(todasLasReservas);
      
      // Actualizar contadores en filtros
      actualizarContadoresFiltros();

    } catch (error) {
      console.error("Error al cargar reservas:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar tus reservas.",
        background: "#1e1e1e",
        color: "#fff"
      });
    }
  }

  function mostrarAlertas(reservas) {
    alertasContainer.innerHTML = "";
    
    // Buscar reservas vencidas
    const reservasVencidas = reservas.filter(r => 
      r.estado === "aprobada" && estaVencida(r.fechaLimiteDevolucion)
    );
    
    // Buscar reservas próximas a vencer (3 días o menos)
    const reservasProximasAVencer = reservas.filter(r => 
      r.estado === "aprobada" && !estaVencida(r.fechaLimiteDevolucion) && 
      getDiasRestantes(r.fechaLimiteDevolucion) <= 3
    );

    // Alerta para reservas vencidas
    if (reservasVencidas.length > 0) {
      const alertaVencidas = document.createElement("div");
      alertaVencidas.className = "alerta alerta-urgente";
      alertaVencidas.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <strong>¡ATENCIÓN!</strong> Tienes ${reservasVencidas.length} libro(s) vencido(s) que debes devolver inmediatamente.
          ${reservasVencidas.length === 1 ? 'Llevas' : 'Algunos llevan'} más de 15 días prestado(s).
        </div>
      `;
      alertasContainer.appendChild(alertaVencidas);
    }

    // Alerta para reservas próximas a vencer
    if (reservasProximasAVencer.length > 0) {
      const alertaProximas = document.createElement("div");
      alertaProximas.className = "alerta alerta-atencion";
      alertaProximas.innerHTML = `
        <i class="fas fa-clock"></i>
        <div>
          <strong>Recordatorio:</strong> Tienes ${reservasProximasAVencer.length} libro(s) que debes devolver pronto.
          Revisa las fechas límite para evitar retrasos.
        </div>
      `;
      alertasContainer.appendChild(alertaProximas);
    }
  }

  function mostrarReservas(reservas) {
    reservasContainer.innerHTML = "";
    
    if (reservas.length === 0) {
      noReservasDiv.style.display = "block";
      return;
    }
    
    noReservasDiv.style.display = "none";
    
    // Ordenar: vencidas primero, luego por fecha más reciente
    const reservasOrdenadas = [...reservas].sort((a, b) => {
      // Reservas vencidas van primero
      const aVencida = a.estado === "aprobada" && estaVencida(a.fechaLimiteDevolucion);
      const bVencida = b.estado === "aprobada" && estaVencida(b.fechaLimiteDevolucion);
      
      if (aVencida && !bVencida) return -1;
      if (!aVencida && bVencida) return 1;
      
      // Luego por fecha de reserva (más reciente primero)
      return new Date(b.fechaReserva) - new Date(a.fechaReserva);
    });

    reservasOrdenadas.forEach(reserva => {
      const card = crearTarjetaReserva(reserva);
      reservasContainer.appendChild(card);
    });
  }

  function crearTarjetaReserva(reserva) {
    const card = document.createElement("div");
    const estadoClase = reserva.estado.toLowerCase();
    const estaVencidaReserva = reserva.estado === "aprobada" && estaVencida(reserva.fechaLimiteDevolucion);
    
    card.className = `reserva-card ${estaVencidaReserva ? 'vencida' : estadoClase}`;
    
    // Información de fechas
    let fechasInfo = `
      <div class="fecha-item">
        <span class="fecha-label">📅 Fecha de reserva:</span>
        <span class="fecha-valor">${formatearFecha(reserva.fechaReserva)}</span>
      </div>
    `;
    
    if (reserva.fechaAprobacion) {
      fechasInfo += `
        <div class="fecha-item">
          <span class="fecha-label">✅ Fecha de aprobación:</span>
          <span class="fecha-valor">${formatearFecha(reserva.fechaAprobacion)}</span>
        </div>
      `;
    }
    
    if (reserva.fechaLimiteDevolucion) {
      fechasInfo += `
        <div class="fecha-item">
          <span class="fecha-label">⏰ Fecha límite devolución:</span>
          <span class="fecha-valor">${formatearFecha(reserva.fechaLimiteDevolucion)}</span>
        </div>
      `;
    }

    // Contador de días para reservas aprobadas
    let contadorDias = "";
    if (reserva.estado === "aprobada" && reserva.fechaLimiteDevolucion) {
      const diasRestantes = getDiasRestantes(reserva.fechaLimiteDevolucion);
      const diasRetraso = getDiasRetraso(reserva.fechaLimiteDevolucion);
      
      if (diasRetraso > 0) {
        contadorDias = `
          <div class="dias-restantes vencido">
            <i class="fas fa-exclamation-triangle"></i>
            <div><strong>¡VENCIDO!</strong></div>
            <div>Llevas ${diasRetraso} día${diasRetraso !== 1 ? 's' : ''} de retraso</div>
            <div style="font-size: 0.9em; margin-top: 0.5rem;">Devuelve el libro cuanto antes</div>
          </div>
        `;
      } else if (diasRestantes <= 1) {
        contadorDias = `
          <div class="dias-restantes urgente">
            <i class="fas fa-clock"></i>
            <div><strong>¡URGENTE!</strong></div>
            <div>Quedan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} para devolver</div>
          </div>
        `;
      } else if (diasRestantes <= 3) {
        contadorDias = `
          <div class="dias-restantes atencion">
            <i class="fas fa-hourglass-half"></i>
            <div><strong>Próximo a vencer</strong></div>
            <div>Quedan ${diasRestantes} días para devolver</div>
          </div>
        `;
      } else {
        contadorDias = `
          <div class="dias-restantes normal">
            <i class="fas fa-calendar-check"></i>
            <div>Quedan ${diasRestantes} días para devolver</div>
          </div>
        `;
      }
    }

    // Botones de acción
    let acciones = "";
    if (reserva.estado === "aprobada") {
      acciones = `
        <div class="reserva-acciones">
          <button class="btn-accion btn-devolver" onclick="devolverLibro(${reserva.id})">
            <i class="fas fa-undo"></i>
            Devolver Libro
          </button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="reserva-header">
        <div class="libro-info">
          <h3>${reserva.libro.titulo}</h3>
          <p class="autor">por ${reserva.libro.autor}</p>
        </div>
        <span class="estado-badge estado-${estaVencidaReserva ? 'vencida' : estadoClase}">
          ${estaVencidaReserva ? 'VENCIDA' : getEstadoTexto(reserva.estado)}
        </span>
      </div>
      
      <div class="fechas-info">
        ${fechasInfo}
      </div>
      
      ${contadorDias}
      ${acciones}
    `;

    return card;
  }

  function filtrarReservas() {
    if (estadoActivo === "todas") {
      mostrarReservas(todasLasReservas);
    } else {
      const reservasFiltradas = todasLasReservas.filter(reserva => {
        if (estadoActivo === "vencida") {
          return reserva.estado === "aprobada" && estaVencida(reserva.fechaLimiteDevolucion);
        }
        return reserva.estado === estadoActivo;
      });
      mostrarReservas(reservasFiltradas);
    }
    
    // Actualizar contador en los botones
    actualizarContadoresFiltros();
  }

  // Nueva función para mostrar contadores en los botones
  function actualizarContadoresFiltros() {
    const contadores = {
      todas: todasLasReservas.length,
      pendiente: todasLasReservas.filter(r => r.estado === "pendiente").length,
      aprobada: todasLasReservas.filter(r => r.estado === "aprobada").length,
      rechazada: todasLasReservas.filter(r => r.estado === "rechazada").length,
      devuelta: todasLasReservas.filter(r => r.estado === "devuelta").length,
      vencida: todasLasReservas.filter(r => r.estado === "aprobada" && estaVencida(r.fechaLimiteDevolucion)).length
    };

    filtrosBotones.forEach(boton => {
      const estado = boton.dataset.estado;
      const contador = contadores[estado] || 0;
      
      // Agregar badge con el número solo si hay reservas
      const existingBadge = boton.querySelector(".contador-badge");
      if (existingBadge) {
        existingBadge.remove();
      }
      
      if (contador > 0) {
        const badge = document.createElement("span");
        badge.className = "contador-badge";
        badge.textContent = contador;
        boton.appendChild(badge);
      }
    });
  }

  // Función global para devolver libro
  window.devolverLibro = async function(reservaId) {
    const resultado = await Swal.fire({
      title: "¿Confirmar devolución?",
      text: "¿Estás seguro de que quieres devolver este libro?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, devolver",
      cancelButtonText: "Cancelar",
      background: "#1e1e1e",
      color: "#fff",
      confirmButtonColor: "#27ae60",
      cancelButtonColor: "#e74c3c"
    });

    if (resultado.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:8080/api/reservas/${reservaId}/devolver`, {
          method: "PUT"
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }

        Swal.fire({
          icon: "success",
          title: "¡Libro devuelto!",
          text: "El libro ha sido devuelto correctamente.",
          background: "#1e1e1e",
          color: "#fff",
          confirmButtonColor: "#27ae60"
        });

        // Recargar reservas
        cargarReservas();

      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          background: "#1e1e1e",
          color: "#fff"
        });
      }
    }
  };

  // Funciones auxiliares
  function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function estaVencida(fechaLimiteISO) {
    if (!fechaLimiteISO) return false;
    const ahora = new Date();
    const fechaLimite = new Date(fechaLimiteISO);
    return ahora > fechaLimite;
  }

  function getDiasRestantes(fechaLimiteISO) {
    if (!fechaLimiteISO) return 0;
    const ahora = new Date();
    const fechaLimite = new Date(fechaLimiteISO);
    const diferencia = fechaLimite - ahora;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    return Math.max(0, dias);
  }

  function getDiasRetraso(fechaLimiteISO) {
    if (!fechaLimiteISO) return 0;
    const ahora = new Date();
    const fechaLimite = new Date(fechaLimiteISO);
    const diferencia = ahora - fechaLimite;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    return Math.max(0, dias);
  }

  function getEstadoTexto(estado) {
    const estados = {
      "pendiente": "PENDIENTE",
      "aprobada": "APROBADA",
      "rechazada": "RECHAZADA",
      "devuelta": "DEVUELTA",
      "vencida": "VENCIDA"
    };
    return estados[estado] || estado.toUpperCase();
  }

  // Actualizar automáticamente cada minuto para mantener los contadores actualizados
  setInterval(() => {
    if (todasLasReservas.length > 0) {
      mostrarAlertas(todasLasReservas);
      filtrarReservas();
    }
  }, 60000); // Cada 60 segundos
});