package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.service.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "http://127.0.0.1:5500") // Live server
public class LibroController {

    @Autowired
    private LibroService libroService;

    @PostMapping
    public Libro crearLibro(@RequestBody Libro libro) {
        return libroService.guardarLibro(libro);
    }

    @GetMapping
    public List<Libro> listarLibros() {
        return libroService.obtenerTodos();
    }
}