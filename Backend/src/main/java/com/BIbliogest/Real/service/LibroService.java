package com.BIbliogest.Real.service;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.repository.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    // Actualizar libro
    public Optional<Libro> actualizar(Long id, Libro libroActualizado) {
        Optional<Libro> libroExistente = libroRepository.findById(id);
        if (libroExistente.isPresent()) {
            Libro libro = libroExistente.get();
            // Evitar valores nulos o vacíos
            if (libroActualizado.getTitulo() != null) libro.setTitulo(libroActualizado.getTitulo());
            if (libroActualizado.getAutor() != null) libro.setAutor(libroActualizado.getAutor());
            if (libroActualizado.getDescripcion() != null) libro.setDescripcion(libroActualizado.getDescripcion());
            if (libroActualizado.getImagen() != null) libro.setImagen(libroActualizado.getImagen());
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
}
