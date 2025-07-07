package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Usuario;
import com.BIbliogest.Real.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // permite que el frontend se conecte
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        Optional<Usuario> existente = usuarioRepository.findByCorreo(usuario.getCorreo());

        if (existente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El correo ya está registrado");
        }

        // Asignar rol USER por defecto
        usuario.setRol("USER");

        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Usuario registrado con éxito");
    }

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody Usuario usuario) {
        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByCorreo(usuario.getCorreo());

        if (usuarioEncontrado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Correo no registrado");
        }

        if (!usuarioEncontrado.get().getContrasena().equals(usuario.getContrasena())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");
        }

        // Devolver todo el objeto Usuario incluyendo el rol
        return ResponseEntity.ok(usuarioEncontrado.get());
    }
}
