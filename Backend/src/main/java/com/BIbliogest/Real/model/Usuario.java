package com.BIbliogest.Real.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Setter;
import java.util.List;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    private String nombre;

    @Setter
    private String correo;

    @Setter
    @JsonIgnore  // No exponer contraseña en JSON
    private String contrasena;

    @Setter
    private String numero;

    @Setter
    private String rol;

    // Relación con reseñas (si la tienes)
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @JsonIgnore  // Evita recursión infinita
    private List<Resena> resenas;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    public String getNumero() {
        return numero;
    }

    public String getRol() {
        return rol;
    }

    public List<Resena> getResenas() {
        return resenas;
    }

    public void setResenas(List<Resena> resenas) {
        this.resenas = resenas;
    }
}