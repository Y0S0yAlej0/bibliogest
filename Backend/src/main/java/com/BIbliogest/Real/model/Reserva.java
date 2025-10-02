package com.BIbliogest.Real.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "reservas")
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "libro_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties({"reservas", "descripcion"})
    private Libro libro;

    @ManyToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties({"reservas", "contrasena", "prestamos", "resenas"})
    private Usuario usuario;

    @Column(nullable = false)
    private String estado = "pendiente"; // pendiente, aprobada, rechazada, devuelta, vencida

    @Column(name = "fecha_reserva", nullable = false)
    private LocalDateTime fechaReserva = LocalDateTime.now();

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Column(name = "fecha_limite_devolucion")
    private LocalDateTime fechaLimiteDevolucion;

    // --- Getters & Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Libro getLibro() {
        return libro;
    }

    public void setLibro(Libro libro) {
        this.libro = libro;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaReserva() {
        return fechaReserva;
    }

    public void setFechaReserva(LocalDateTime fechaReserva) {
        this.fechaReserva = fechaReserva;
    }

    public LocalDateTime getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDateTime fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
        if (fechaAprobacion != null) {
            this.fechaLimiteDevolucion = fechaAprobacion.plusDays(15);
        }
    }

    public LocalDateTime getFechaLimiteDevolucion() {
        return fechaLimiteDevolucion;
    }

    public void setFechaLimiteDevolucion(LocalDateTime fechaLimiteDevolucion) {
        this.fechaLimiteDevolucion = fechaLimiteDevolucion;
    }

    // --- Métodos de ayuda ---
    public void aprobar() {
        this.estado = "aprobada";
        this.fechaAprobacion = LocalDateTime.now();
        this.fechaLimiteDevolucion = this.fechaAprobacion.plusDays(15);
    }

    public void rechazar() {
        this.estado = "rechazada";
    }

    public boolean estaPendiente() {
        return "pendiente".equalsIgnoreCase(this.estado);
    }

    public boolean estaAprobada() {
        return "aprobada".equalsIgnoreCase(this.estado);
    }

    public boolean estaVencida() {
        return estaAprobada() && fechaLimiteDevolucion != null &&
                LocalDateTime.now().isAfter(fechaLimiteDevolucion);
    }

    public long getDiasRestantes() {
        if (!estaAprobada() || fechaLimiteDevolucion == null) {
            return 0;
        }
        long dias = ChronoUnit.DAYS.between(LocalDateTime.now(), fechaLimiteDevolucion);
        return Math.max(0, dias);
    }

    public long getDiasRetraso() {
        if (!estaAprobada() || fechaLimiteDevolucion == null) {
            return 0;
        }
        long dias = ChronoUnit.DAYS.between(fechaLimiteDevolucion, LocalDateTime.now());
        return Math.max(0, dias);
    }
}