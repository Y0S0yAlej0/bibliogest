package com.BIbliogest.Real.service;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.repository.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    public Libro guardarLibro(Libro libro) {
        return libroRepository.save(libro);
    }

    public List<Libro> obtenerTodos() {
        return libroRepository.findAll();
    }
}