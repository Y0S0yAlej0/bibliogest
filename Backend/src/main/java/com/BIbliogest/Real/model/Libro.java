package com.BIbliogest.Real.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "libro")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String genero;

    @Column(nullable = false, unique = true)
    private String isbn;

    private String imagen;

    @Column(length = 1000)
    private String descripcion;

    private String autor;
}
