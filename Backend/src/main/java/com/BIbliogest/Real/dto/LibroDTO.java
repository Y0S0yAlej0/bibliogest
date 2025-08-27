package com.BIbliogest.Real.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LibroDTO {

    private Long id;
    private String titulo;
    private String autor;
    private String sinopsis;
    private String registro;
    private String categoria;

    @JsonProperty("signaturaTopografica")
    private String signaturaTopografica;

    @JsonProperty("cantidadRegistro")
    private Integer cantidadRegistro;

    private Integer paginas;
    private String ejemplar;
    private String url;
    private String observaciones;
    private String imagen;
    private String estado;
    private Integer cantidad;

    // Constructores
    public LibroDTO() {}

    public LibroDTO(String titulo, String autor, String sinopsis, String registro,
                    String categoria, String signaturaTopografica, Integer cantidadRegistro,
                    Integer paginas, String ejemplar, String url, String observaciones,
                    String imagen, String estado, Integer cantidad) {
        this.titulo = titulo;
        this.autor = autor;
        this.sinopsis = sinopsis;
        this.registro = registro;
        this.categoria = categoria;
        this.signaturaTopografica = signaturaTopografica;
        this.cantidadRegistro = cantidadRegistro;
        this.paginas = paginas;
        this.ejemplar = ejemplar;
        this.url = url;
        this.observaciones = observaciones;
        this.imagen = imagen;
        this.estado = estado;
        this.cantidad = cantidad;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public String getSinopsis() { return sinopsis; }
    public void setSinopsis(String sinopsis) { this.sinopsis = sinopsis; }

    public String getRegistro() { return registro; }
    public void setRegistro(String registro) { this.registro = registro; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getSignaturaTopografica() { return signaturaTopografica; }
    public void setSignaturaTopografica(String signaturaTopografica) {
        this.signaturaTopografica = signaturaTopografica;
    }

    public Integer getCantidadRegistro() { return cantidadRegistro; }
    public void setCantidadRegistro(Integer cantidadRegistro) {
        this.cantidadRegistro = cantidadRegistro;
    }

    public Integer getPaginas() { return paginas; }
    public void setPaginas(Integer paginas) { this.paginas = paginas; }

    public String getEjemplar() { return ejemplar; }
    public void setEjemplar(String ejemplar) { this.ejemplar = ejemplar; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    // Métodos de compatibilidad con código existente
    public String getGenero() { return categoria; }
    public void setGenero(String genero) { this.categoria = genero; }

    public String getDescripcion() { return sinopsis; }
    public void setDescripcion(String descripcion) { this.sinopsis = descripcion; }

    public String getIsbn() { return registro; }
    public void setIsbn(String isbn) { this.registro = isbn; }
}