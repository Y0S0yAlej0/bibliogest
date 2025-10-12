package com.BIbliogest.Real.service;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.repository.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    // Crear libro
    public Libro guardar(Libro libro) {
        return libroRepository.save(libro);
    }

    // Obtener todos los libros
    public List<Libro> obtenerTodos() {
        return libroRepository.findAll();
    }

    // 🆕 Obtener libros por categoría
    public List<Libro> obtenerPorCategoria(String categoria) {
        return libroRepository.findAll().stream()
                .filter(libro -> categoria.equalsIgnoreCase(libro.getGenero()))
                .collect(Collectors.toList());
    }

    // Obtener libro por ID
    public Optional<Libro> obtenerPorId(Long id) {
        return libroRepository.findById(id);
    }

    // Actualizar libro
    public Optional<Libro> actualizar(Long id, Libro libroActualizado) {
        Optional<Libro> libroExistente = libroRepository.findById(id);
        if (libroExistente.isPresent()) {
            Libro libro = libroExistente.get();

            if (libroActualizado.getTitulo() != null && !libroActualizado.getTitulo().trim().isEmpty()) {
                libro.setTitulo(libroActualizado.getTitulo());
            }
            if (libroActualizado.getAutor() != null && !libroActualizado.getAutor().trim().isEmpty()) {
                libro.setAutor(libroActualizado.getAutor());
            }
            if (libroActualizado.getSinopsis() != null && !libroActualizado.getSinopsis().trim().isEmpty()) {
                libro.setSinopsis(libroActualizado.getSinopsis());
            }
            if (libroActualizado.getRegistro() != null && !libroActualizado.getRegistro().trim().isEmpty()) {
                libro.setRegistro(libroActualizado.getRegistro());
            }
            if (libroActualizado.getGenero() != null && !libroActualizado.getGenero().trim().isEmpty()) {
                libro.setGenero(libroActualizado.getGenero());
            }
            if (libroActualizado.getSignaturaTopografica() != null && !libroActualizado.getSignaturaTopografica().trim().isEmpty()) {
                libro.setSignaturaTopografica(libroActualizado.getSignaturaTopografica());
            }
            if (libroActualizado.getCantidadRegistro() != null) {
                libro.setCantidadRegistro(libroActualizado.getCantidadRegistro());
            }
            if (libroActualizado.getPaginas() != null) {
                libro.setPaginas(libroActualizado.getPaginas());
            }
            if (libroActualizado.getEjemplar() != null && !libroActualizado.getEjemplar().trim().isEmpty()) {
                libro.setEjemplar(libroActualizado.getEjemplar());
            }
            if (libroActualizado.getObservaciones() != null && !libroActualizado.getObservaciones().trim().isEmpty()) {
                libro.setObservaciones(libroActualizado.getObservaciones());
            }
            if (libroActualizado.getImagen() != null && !libroActualizado.getImagen().trim().isEmpty()) {
                libro.setImagen(libroActualizado.getImagen());
            }
            if (libroActualizado.getEstado() != null && !libroActualizado.getEstado().trim().isEmpty()) {
                libro.setEstado(libroActualizado.getEstado());
            }
            if (libroActualizado.getCantidad() != null) {
                libro.setCantidad(libroActualizado.getCantidad());
            }

            return Optional.of(libroRepository.save(libro));
        } else {
            return Optional.empty();
        }
    }

    // Eliminar libro
    public boolean eliminar(Long id) {
        Optional<Libro> libro = libroRepository.findById(id);
        if (libro.isPresent()) {
            libroRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    // Verificar si un libro existe
    public boolean existe(Long id) {
        return libroRepository.existsById(id);
    }
}