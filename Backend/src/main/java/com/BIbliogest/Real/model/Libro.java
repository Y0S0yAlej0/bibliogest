package com.BIbliogest.Real.model;

import jakarta.persistence.*;

@Entity
@Table(name = "libro")
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private String autor;

    @Column(name = "sinopsis", columnDefinition = "TEXT")
    private String sinopsis;

    @Column(name = "registro")
    private String registro;

    // CAMBIO: Usar genero en lugar de categoria para coincidir con la BD
    @Column(name = "genero", nullable = false)
    private String genero;

    @Column(name = "signatura_topografica")
    private String signaturaTopografica;

    @Column(name = "cantidad_registro")
    private Integer cantidadRegistro;

    @Column(name = "paginas")
    private Integer paginas;

    @Column(name = "ejemplar")
    private String ejemplar;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "imagen")
    private String imagen;

    @Column(name = "estado")
    private String estado;

    @Column(name = "cantidad")
    private Integer cantidad;

    // Constructores
    public Libro() {}

    public Libro(String titulo, String autor, String sinopsis, String registro,
                 String genero, String signaturaTopografica, Integer cantidadRegistro,
                 Integer paginas, String ejemplar, String observaciones,
                 String imagen, String estado, Integer cantidad) {
        this.titulo = titulo;
        this.autor = autor;
        this.sinopsis = sinopsis;
        this.registro = registro;
        this.genero = genero;
        this.signaturaTopografica = signaturaTopografica;
        this.cantidadRegistro = cantidadRegistro;
        this.paginas = paginas;
        this.ejemplar = ejemplar;
        this.observaciones = observaciones;
        this.imagen = imagen;
        this.estado = estado;
        this.cantidad = cantidad;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getSinopsis() {
        return sinopsis;
    }

    public void setSinopsis(String sinopsis) {
        this.sinopsis = sinopsis;
    }

    public String getRegistro() {
        return registro;
    }

    public void setRegistro(String registro) {
        this.registro = registro;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getSignaturaTopografica() {
        return signaturaTopografica;
    }

    public void setSignaturaTopografica(String signaturaTopografica) {
        this.signaturaTopografica = signaturaTopografica;
    }

    public Integer getCantidadRegistro() {
        return cantidadRegistro;
    }

    public void setCantidadRegistro(Integer cantidadRegistro) {
        this.cantidadRegistro = cantidadRegistro;
    }

    public Integer getPaginas() {
        return paginas;
    }

    public void setPaginas(Integer paginas) {
        this.paginas = paginas;
    }

    public String getEjemplar() {
        return ejemplar;
    }

    public void setEjemplar(String ejemplar) {
        this.ejemplar = ejemplar;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    // Métodos de compatibilidad - IMPORTANTE: mapear categoria a genero
    public String getCategoria() {
        return genero;
    }

    public void setCategoria(String categoria) {
        this.genero = categoria;
    }

    public String getDescripcion() {
        return sinopsis;
    }

    public void setDescripcion(String descripcion) {
        this.sinopsis = descripcion;
    }

    public String getIsbn() {
        return registro;
    }

    public void setIsbn(String isbn) {
        this.registro = isbn;
    }
}