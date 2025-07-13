package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Resena;
import com.BIbliogest.Real.model.Usuario;
import com.BIbliogest.Real.repository.ResenaRepository;
import com.BIbliogest.Real.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
    public List<Resena> obtenerResenas() {
        return resenaRepository.findAll();
    }

    // Crear una nueva reseña
    @PostMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> crearResena(
            @PathVariable Long idUsuario,
            @RequestBody Resena resena) {

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        resena.setUsuario(usuarioOpt.get());
        resena.setFecha(LocalDateTime.now().toLocalDate());

        Resena guardada = resenaRepository.save(resena);
        return ResponseEntity.ok(guardada);
    }
}