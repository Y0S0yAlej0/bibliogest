package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Usuario;
import com.BIbliogest.Real.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/registro")
    @Transactional
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        // Validar que los campos no estén vacíos
        if (usuario.getCorreo() == null || usuario.getContrasena() == null) {
            return ResponseEntity.badRequest().body("Correo y contraseña son obligatorios");
        }

        // Validar longitud de contraseña
        String contrasena = usuario.getContrasena().trim();
        if (contrasena.length() < 8) {
            return ResponseEntity.badRequest().body("La contraseña debe tener mínimo 8 caracteres");
        }
        if (contrasena.length() > 16) {
            return ResponseEntity.badRequest().body("La contraseña debe tener máximo 16 caracteres");
        }

        String correoLimpio = usuario.getCorreo().trim().toLowerCase();
        Optional<Usuario> existente = usuarioRepository.findByCorreo(correoLimpio);

        if (existente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El correo ya está registrado");
        }

        usuario.setCorreo(correoLimpio);

        // Encriptar la contraseña antes de guardar
        String contrasenaEncriptada = passwordEncoder.encode(contrasena);
        usuario.setContrasena(contrasenaEncriptada);

        usuario.setNombre(usuario.getNombre().trim());
        usuario.setRol("user");

        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Usuario registrado con éxito");
    }

    @PostMapping("/login")
    @Transactional(readOnly = true)
    public ResponseEntity<?> iniciarSesion(@RequestBody Usuario usuario) {
        // Validar que los campos no estén vacíos
        if (usuario.getCorreo() == null || usuario.getContrasena() == null) {
            return ResponseEntity.badRequest().body("Correo y contraseña son obligatorios");
        }

        String correoLimpio = usuario.getCorreo().trim().toLowerCase();
        String contrasenaLimpia = usuario.getContrasena().trim();

        System.out.println("🔍 Buscando usuario: " + correoLimpio);

        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByCorreo(correoLimpio);

        if (usuarioEncontrado.isEmpty()) {
            System.out.println("❌ Usuario NO encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Correo no registrado");
        }

        Usuario usuarioDB = usuarioEncontrado.get();
        String contrasenaEncriptadaDB = usuarioDB.getContrasena();

        System.out.println("✅ Usuario encontrado: " + usuarioDB.getNombre());

        // Comparar contraseña usando passwordEncoder.matches()
        if (!passwordEncoder.matches(contrasenaLimpia, contrasenaEncriptadaDB)) {
            System.out.println("❌ Contraseñas NO coinciden");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");
        }

        System.out.println("✅ Login exitoso");
        return ResponseEntity.ok(usuarioDB);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioActualizado) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findById(id);

        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }

        Usuario usuarioExistente = usuarioOptional.get();
        usuarioExistente.setNombre(usuarioActualizado.getNombre());
        usuarioExistente.setNumero(usuarioActualizado.getNumero());

        if (usuarioActualizado.getContrasena() != null && !usuarioActualizado.getContrasena().isEmpty()) {
            // Validar longitud de contraseña al actualizar
            String nuevaContrasena = usuarioActualizado.getContrasena().trim();
            if (nuevaContrasena.length() < 8 || nuevaContrasena.length() > 16) {
                return ResponseEntity.badRequest().body("La contraseña debe tener entre 8 y 16 caracteres");
            }

            // Encriptar la nueva contraseña
            String contrasenaEncriptada = passwordEncoder.encode(nuevaContrasena);
            usuarioExistente.setContrasena(contrasenaEncriptada);
        }

        usuarioRepository.save(usuarioExistente);
        return ResponseEntity.ok(usuarioExistente);
    }
}