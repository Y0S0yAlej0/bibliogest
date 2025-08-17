package com.BIbliogest.Real.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas") // 👈 asegúrate de que coincida con tu tabla en BD
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con libro
    @ManyToOne
    @JoinColumn(name = "libro_id", referencedColumnName = "id", nullable = false) // 👈 columna correcta en BD
    private Libro libro;

    // Relación con usuario
    @ManyToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id", nullable = false) // 👈 columna correcta en BD
    private Usuario usuario;

    @Column(nullable = false)
    private String estado = "pendiente"; // pendiente, aprobada, rechazada

    @Column(name = "fecha_reserva", nullable = false)
    private LocalDateTime fechaReserva = LocalDateTime.now();

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

    // --- Métodos de ayuda ---
    public void aprobar() {
        this.estado = "aprobada";
    }

    public void rechazar() {
        this.estado = "rechazada";
    }

    public boolean estaPendiente() {
        return "pendiente".equalsIgnoreCase(this.estado);
    }
}
