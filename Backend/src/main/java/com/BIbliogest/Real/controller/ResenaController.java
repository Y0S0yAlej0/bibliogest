package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Resena;
import com.BIbliogest.Real.model.Usuario;
import com.BIbliogest.Real.repository.ResenaRepository;
import com.BIbliogest.Real.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = "*")
public class ResenaController {

    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Obtener todas las reseñas
    @GetMapping
    public ResponseEntity<List<Resena>> obtenerResenas() {
        try {
            List<Resena> resenas = resenaRepository.findAll();
            return ResponseEntity.ok(resenas);
        } catch (Exception e) {
            System.err.println("Error al obtener reseñas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Crear una nueva reseña
    @PostMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> crearResena(
            @PathVariable Long idUsuario,
            @RequestBody Resena resena) {

        try {
            System.out.println("=== Creando reseña ===");
            System.out.println("ID Usuario: " + idUsuario);
            System.out.println("Calificación: " + resena.getCalificacion());
            System.out.println("Contenido: " + resena.getContenido());

            // Validar que el usuario existe
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(crearRespuestaError("Usuario no encontrado"));
            }

            // Validar calificación
            if (resena.getCalificacion() < 1 || resena.getCalificacion() > 5) {
                return ResponseEntity.badRequest()
                        .body(crearRespuestaError("La calificación debe estar entre 1 y 5"));
            }

            // Validar contenido
            if (resena.getContenido() == null || resena.getContenido().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(crearRespuestaError("El contenido no puede estar vacío"));
            }

            // Asignar usuario y fecha
            resena.setUsuario(usuarioOpt.get());
            resena.setFecha(LocalDate.now());

            // Guardar
            Resena guardada = resenaRepository.save(resena);
            System.out.println("Reseña guardada exitosamente con ID: " + guardada.getId());

            return ResponseEntity.ok(guardada);

        } catch (Exception e) {
            System.err.println("ERROR al crear reseña:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearRespuestaError("Error al guardar la reseña: " + e.getMessage()));
        }
    }

    // Método auxiliar para crear respuestas de error consistentes
    private Map<String, String> crearRespuestaError(String mensaje) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        return error;
    }
}