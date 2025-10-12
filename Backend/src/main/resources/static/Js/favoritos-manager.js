class FavoritosManager {
    constructor() {
        this.usuario = null;
        this.favoritos = [];
        this.librosData = [];
        this.init();
    }

    init() {
        this.usuario = JSON.parse(localStorage.getItem("usuario"));
        this.cargarFavoritos();
        console.log("📱 FavoritosManager inicializado:", {
            usuario: this.usuario?.id,
            favoritos: this.favoritos.length
        });
    }

    cargarFavoritos() {
        if (!this.usuario) {
            this.favoritos = [];
            return;
        }
        
        const favoritosGuardados = localStorage.getItem(`favoritos_${this.usuario.id}`);
        this.favoritos = favoritosGuardados ? JSON.parse(favoritosGuardados) : [];
        console.log("❤️ Favoritos cargados:", this.favoritos);
    }

    guardarFavoritos() {
        if (!this.usuario) return;
        
        localStorage.setItem(`favoritos_${this.usuario.id}`, JSON.stringify(this.favoritos));
        console.log("💾 Favoritos guardados:", this.favoritos);
        
        // Disparar evento personalizado para notificar cambios
        window.dispatchEvent(new CustomEvent('favoritosChanged', { 
            detail: { 
                favoritos: this.favoritos,
                total: this.favoritos.length 
            } 
        }));
    }

    esFavorito(libroId) {
        return this.favoritos.some(fav => fav.libroId === parseInt(libroId));
    }

    async toggleFavorito(libroId, libroData = null) {
        console.log("🔄 Toggle favorito:", { libroId, usuario: this.usuario?.id });
        
        if (!this.usuario || !this.usuario.id) {
            await Swal.fire({
                title: "⚠️ Necesitas iniciar sesión",
                text: "Para agregar libros a favoritos, debes estar registrado",
                icon: "warning",
                confirmButtonText: "Ir al login",
                showCancelButton: true,
                cancelButtonText: "Cancelar"
            });
            return false;
        }

        const libroIdNum = parseInt(libroId);
        const yaEsFavorito = this.esFavorito(libroIdNum);
        
        // Si no tenemos datos del libro, intentar obtenerlos
        if (!libroData && window.librosData) {
            libroData = window.librosData.find(l => l.id === libroIdNum);
        }

        if (yaEsFavorito) {
            // Quitar de favoritos
            this.favoritos = this.favoritos.filter(fav => fav.libroId !== libroIdNum);
            this.guardarFavoritos();
            
            await Swal.fire({
                title: "💔 Quitado de favoritos",
                text: libroData ? `"${libroData.titulo}" fue removido de tus favoritos` : "Libro removido de favoritos",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            this.actualizarBoton(libroIdNum, false);
            return false;
        } else {
            // Agregar a favoritos
            this.favoritos.push({
                libroId: libroIdNum,
                fechaAgregado: new Date().toISOString()
            });
            this.guardarFavoritos();
            
            const result = await Swal.fire({
                title: "❤️ ¡Agregado a favoritos!",
                text: libroData ? `"${libroData.titulo}" se agregó a tu lista` : "Libro agregado a favoritos",
                icon: "success",
                showCancelButton: true,
                confirmButtonText: "Seguir navegando",
                cancelButtonText: "Ver favoritos",
                timer: 3000,
                timerProgressBar: true
            });

            if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.href = "mis-favoritos.html";
            }

            this.actualizarBoton(libroIdNum, true);
            return true;
        }
    }

    actualizarBoton(libroId, esFavorito) {
        const btn = document.querySelector(`[data-libro-id="${libroId}"]`);
        if (btn) {
            if (esFavorito) {
                btn.classList.add('favorito-activo');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fas fa-heart';
            } else {
                btn.classList.remove('favorito-activo');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'far fa-heart';
            }
        }
    }

    getContador() {
        return this.favoritos.length;
    }

    getFavoritos() {
        return this.favoritos;
    }

    limpiarFavoritos() {
        this.favoritos = [];
        this.guardarFavoritos();
    }
}

// Crear instancia global
window.favoritosManager = new FavoritosManager();

// Funciones globales para compatibilidad
window.toggleFavorito = function(libroId, libroData) {
    return window.favoritosManager.toggleFavorito(libroId, libroData);
};

window.esFavorito = function(libroId) {
    return window.favoritosManager.esFavorito(libroId);
};

window.getContadorFavoritos = function() {
    return window.favoritosManager.getContador();
};
