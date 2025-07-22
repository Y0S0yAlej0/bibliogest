package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.service.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "http://127.0.0.1:5500") // Permitir peticiones desde Live Server
public class LibroController {

    @Autowired
    private LibroService servicio;

    // Obtener todos los libros
    @GetMapping
    public List<Libro> obtenerLibros() {
        return servicio.obtenerTodos();
    }

    // Crear un nuevo libro
    @PostMapping
    public ResponseEntity<?> crearLibro(@RequestBody Libro libro) {
        try {
            Libro nuevo = servicio.guardar(libro);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error al guardar el libro: " + e.getMessage());
        }
    }

    // Actualizar un libro existente por ID
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarLibro(@PathVariable Long id, @RequestBody Libro libro) {
        try {
            Optional<Libro> actualizado = servicio.actualizar(id, libro);
            return actualizado.isPresent()
                    ? ResponseEntity.ok(actualizado.get())
                    : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error al actualizar el libro: " + e.getMessage());
        }
    }

    // Eliminar un libro por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarLibro(@PathVariable Long id) {
        try {
            boolean eliminado = servicio.eliminar(id);
            if (eliminado) {
                return ResponseEntity.ok("✅ Libro eliminado correctamente.");
            } else {
                return ResponseEntity.status(404).body("❌ Libro no encontrado para eliminar.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error al eliminar el libro: " + e.getMessage());
        }
    }
}
