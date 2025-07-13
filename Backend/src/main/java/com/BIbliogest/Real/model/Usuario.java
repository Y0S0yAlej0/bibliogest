package com.BIbliogest.Real.model;

import jakarta.persistence.*;
import lombok.Setter;

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
    private String contrasena;
    @Setter
    private String numero;
    @Setter
    private String rol;


    // Getters y Setters

    public Long getId() { return id; }

    public String getNombre() { return nombre; }

    public String getCorreo() { return correo; }

    public String getContrasena() { return contrasena; }

    public String getNumero() { return numero; }

    public String getRol() { return rol; }
}
