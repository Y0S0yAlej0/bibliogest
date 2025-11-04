   const API_URL = "http://localhost:8080/api";
    let usuario = null;
    let reservas = [];

    document.addEventListener("DOMContentLoaded", async function() {
      usuario = JSON.parse(localStorage.getItem("usuario"));

      if (!usuario || !usuario.id) {
        Swal.fire({
          icon: "warning",
          title: "Acceso denegado",
          text: "Debes iniciar sesión para ver tu perfil.",
          background: "#1e1e1e",
          color: "#fff",
          confirmButtonColor: "#3085d6"
        }).then(() => {
          window.location.href = "login.html";
        });
        return;
      }

      await cargarDatosPerfil();
    });

    async function cargarDatosPerfil() {
      try {
        // Cargar reservas del usuario
        const responseReservas = await fetch(`${API_URL}/reservas/usuario/${usuario.id}`);
        reservas = await responseReservas.json();

        renderizarPerfil();
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los datos del perfil",
          background: "#1e1e1e",
          color: "#fff"
        });
      }
    }

    function renderizarPerfil() {
      const iniciales = usuario.nombre.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      const rolTexto = usuario.rol && usuario.rol.toUpperCase() === 'ADMIN' ? 'Administrador' : 'Usuario';
      const rolIcon = usuario.rol && usuario.rol.toUpperCase() === 'ADMIN' ? '👑' : '👤';

      // Calcular estadísticas
      const totalReservas = reservas.length;
      const reservasActivas = reservas.filter(r => r.estado === 'aprobada').length;
      const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
      const reservasCompletadas = reservas.filter(r => r.estado === 'devuelta').length;

      // Actividad reciente (últimas 5 reservas)
      const actividadReciente = reservas
        .sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva))
        .slice(0, 5);

      const html = `
        <!-- Header del Perfil -->
        <div class="perfil-header">
          <div class="header-content">
            <div class="avatar-section">
              <div class="avatar-circle">${iniciales}</div>
              <div class="avatar-badge">
                ${rolIcon}
              </div>
            </div>
            <div class="user-info-header">
              <h1 class="user-name">${usuario.nombre}</h1>
              <p class="user-email">
                <i class="fas fa-envelope"></i>
                ${usuario.correo}
              </p>
              <span class="user-role">${rolTexto}</span>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-number">${totalReservas}</div>
            <div class="stat-label">Total Reservas</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-number">${reservasActivas}</div>
            <div class="stat-label">Activas</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-number">${reservasPendientes}</div>
            <div class="stat-label">Pendientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-number">${reservasCompletadas}</div>
            <div class="stat-label">Completadas</div>
          </div>
        </div>

        <!-- Grid de Información -->
        <div class="perfil-grid">
          <!-- Información Personal -->
          <div class="perfil-card">
            <div class="card-header">
              <div class="card-icon">
                <i class="fas fa-user"></i>
              </div>
              <h2 class="card-title">Información Personal</h2>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-id-card"></i>
                Nombre Completo
              </span>
              <span class="info-value">${usuario.nombre}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-envelope"></i>
                Correo Electrónico
              </span>
              <span class="info-value">${usuario.correo}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-phone"></i>
                Teléfono
              </span>
              <span class="info-value">${usuario.numero || 'No registrado'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                <i class="fas fa-shield-alt"></i>
                Rol
              </span>
              <span class="info-value">${rolTexto}</span>
            </div>
          </div>

          <!-- Actividad Reciente -->
          <div class="perfil-card">
            <div class="card-header">
              <div class="card-icon">
                <i class="fas fa-clock"></i>
              </div>
              <h2 class="card-title">Actividad Reciente</h2>
            </div>
            ${actividadReciente.length > 0 ? 
              actividadReciente.map(reserva => {
                const iconos = {
                  'pendiente': '⏳',
                  'aprobada': '✅',
                  'rechazada': '❌',
                  'devuelta': '📖'
                };
                const fecha = new Date(reserva.fechaReserva).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                return `
                  <div class="actividad-item">
                    <div class="actividad-icon">
                      ${iconos[reserva.estado] || '📚'}
                    </div>
                    <div class="actividad-content">
                      <div class="actividad-titulo">${reserva.libro.titulo}</div>
                      <div class="actividad-fecha">${fecha} - ${reserva.estado}</div>
                    </div>
                  </div>
                `;
              }).join('')
              : '<p style="text-align: center; color: var(--color-text-muted); padding: 20px;">No hay actividad reciente</p>'
            }
          </div>
        </div>

        <!-- Acciones del Perfil -->
        <div class="perfil-card">
          <div class="card-header">
            <div class="card-icon">
              <i class="fas fa-cog"></i>
            </div>
            <h2 class="card-title">Acciones de Cuenta</h2>
          </div>
          <div class="acciones-perfil">
            <button class="btn-accion btn-primary" onclick="editarPerfil()">
              <i class="fas fa-edit"></i>
              Editar Perfil
            </button>
            <button class="btn-accion btn-primary" onclick="cambiarContrasena()">
              <i class="fas fa-key"></i>
              Cambiar Contraseña
            </button>
            <button class="btn-accion btn-secondary" onclick="cerrarSesion()">
              <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      `;

      document.getElementById('perfilContainer').innerHTML = html;
    }

    async function editarPerfil() {
      const { value: formValues } = await Swal.fire({
        title: '✏️ Editar Perfil',
        html: `
          <div style="text-align: left;">
            <label style="display: block; margin: 10px 0 5px; color: #caa54f; font-weight: 600;">Nombre:</label>
            <input id="swal-nombre" class="swal2-input" value="${usuario.nombre}" style="width: 90%; margin: 0;">
            
            <label style="display: block; margin: 15px 0 5px; color: #caa54f; font-weight: 600;">Teléfono:</label>
            <input id="swal-numero" class="swal2-input" value="${usuario.numero || ''}" style="width: 90%; margin: 0;">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        background: '#1e1e1e',
        color: '#fff',
        confirmButtonColor: '#2B7A78',
        preConfirm: () => {
          return {
            nombre: document.getElementById('swal-nombre').value,
            numero: document.getElementById('swal-numero').value
          }
        }
      });

      if (formValues) {
        try {
          const response = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...usuario,
              nombre: formValues.nombre,
              numero: formValues.numero
            })
          });

          if (!response.ok) throw new Error("Error al actualizar");

          const usuarioActualizado = await response.json();
          localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
          usuario = usuarioActualizado;

          await Swal.fire({
            icon: 'success',
            title: '¡Perfil actualizado!',
            text: 'Los cambios se guardaron correctamente',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#2B7A78'
          });

          renderizarPerfil();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el perfil',
            background: '#1e1e1e',
            color: '#fff'
          });
        }
      }
    }

    async function cambiarContrasena() {
      const { value: nuevaContrasena } = await Swal.fire({
        title: '🔑 Cambiar Contraseña',
        html: `
          <div style="text-align: left;">
            <label style="display: block; margin: 10px 0 5px; color: #caa54f; font-weight: 600;">Nueva Contraseña:</label>
            <input id="swal-password" type="password" class="swal2-input" placeholder="Mínimo 8 caracteres" style="width: 90%; margin: 0;">
            
            <label style="display: block; margin: 15px 0 5px; color: #caa54f; font-weight: 600;">Confirmar Contraseña:</label>
            <input id="swal-password-confirm" type="password" class="swal2-input" placeholder="Repite la contraseña" style="width: 90%; margin: 0;">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Cambiar',
        cancelButtonText: 'Cancelar',
        background: '#1e1e1e',
        color: '#fff',
        confirmButtonColor: '#2B7A78',
        preConfirm: () => {
          const pass = document.getElementById('swal-password').value;
          const passConfirm = document.getElementById('swal-password-confirm').value;
          
          if (!pass || pass.length < 8) {
            Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres');
            return false;
          }
          
          if (pass !== passConfirm) {
            Swal.showValidationMessage('Las contraseñas no coinciden');
            return false;
          }
          
          return pass;
        }
      });

      if (nuevaContrasena) {
        try {
          const response = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...usuario,
              contrasena: nuevaContrasena
            })
          });

          if (!response.ok) throw new Error("Error al cambiar contraseña");

          await Swal.fire({
            icon: 'success',
            title: '¡Contraseña actualizada!',
            text: 'Tu contraseña ha sido cambiada exitosamente',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#2B7A78'
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cambiar la contraseña',
            background: '#1e1e1e',
            color: '#fff'
          });
        }
      }
    }

    function cerrarSesion() {
      Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que quieres salir?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        background: '#1e1e1e',
        color: '#fff',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#2B7A78'
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("usuario");
          window.location.href = "login.html";
        }
      });
    }