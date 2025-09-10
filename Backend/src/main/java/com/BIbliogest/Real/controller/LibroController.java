package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.model.Reserva;
import com.BIbliogest.Real.service.LibroService;
import com.BIbliogest.Real.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "http://127.0.0.1:5500") // Permitir peticiones desde Live Server
public class LibroController {

    @Autowired
    private LibroService servicio;

    @Autowired
    private ReservaRepository reservaRepository;

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

    // 🔧 MÉTODO DELETE ACTUALIZADO CON ELIMINACIÓN EN CASCADA
    @DeleteMapping("/{id}")
    @Transactional  // Importante: asegura que todo se haga en una transacción
    public ResponseEntity<?> eliminarLibro(@PathVariable Long id) {
        try {
            // 🔍 PASO 1: Verificar que el libro existe usando el servicio
            Optional<Libro> libroOpt = servicio.obtenerPorId(id);
            if (!libroOpt.isPresent()) {
                return ResponseEntity.status(404).body("❌ Libro no encontrado para eliminar.");
            }

            Libro libro = libroOpt.get();
            String tituloLibro = libro.getTitulo();

            // 🔍 PASO 2: Contar y obtener información de las reservas
            long reservasCount = reservaRepository.countByLibroId(id);
            System.out.println("📊 Libro '" + tituloLibro + "' (ID: " + id + ") tiene " + reservasCount + " reserva(s) asociada(s)");

            // 🗑️ PASO 3: Eliminar todas las reservas asociadas al libro
            int reservasEliminadas = 0;
            if (reservasCount > 0) {
                reservasEliminadas = reservaRepository.deleteByLibroId(id);
                System.out.println("🗑️ Eliminadas " + reservasEliminadas + " reserva(s) del libro: " + tituloLibro);
            }

            // 🗑️ PASO 4: Ahora eliminar el libro usando el servicio
            boolean eliminado = servicio.eliminar(id);

            if (eliminado) {
                System.out.println("📚 Libro eliminado exitosamente: " + tituloLibro + " (ID: " + id + ")");

                // ✅ Respuesta de éxito con información detallada
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("mensaje", "Libro y reservas eliminados exitosamente");
                response.put("libroId", id);
                response.put("titulo", tituloLibro);
                response.put("autor", libro.getAutor());
                response.put("reservasEliminadas", reservasEliminadas);
                response.put("detalles", "Eliminación en cascada completada correctamente");

                return ResponseEntity.ok(response);
            } else {
                // Si el servicio no pudo eliminar el libro
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "No se pudo eliminar el libro después de eliminar las reservas");
                error.put("libroId", id);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

        } catch (Exception e) {
            // 📝 Log detallado del error
            System.err.println("❌ Error al eliminar libro ID " + id + ": " + e.getMessage());
            e.printStackTrace();

            // 📤 Respuesta de error detallada
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al eliminar el libro");
            error.put("detalle", e.getMessage());
            error.put("libroId", id);
            error.put("tipo", e.getClass().getSimpleName());

            // Verificar si es un error de restricción de clave foránea
            if (e.getMessage() != null && e.getMessage().contains("foreign key constraint")) {
                error.put("causa", "El libro tiene reservas asociadas que impiden su eliminación");
                error.put("solucion", "Intenta nuevamente - el sistema intentará eliminar las reservas automáticamente");
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 🔧 MÉTODO AUXILIAR: Obtener información de reservas de un libro (para debugging)
    @GetMapping("/{id}/reservas")
    public ResponseEntity<?> obtenerReservasDeLibro(@PathVariable Long id) {
        try {
            // Verificar que el libro existe
            Optional<Libro> libroOpt = servicio.obtenerPorId(id);
            if (!libroOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Obtener reservas
            List<Reserva> reservas = reservaRepository.findByLibroId(id);
            long count = reservaRepository.countByLibroId(id);

            Map<String, Object> response = new HashMap<>();
            response.put("libroId", id);
            response.put("titulo", libroOpt.get().getTitulo());
            response.put("totalReservas", count);
            response.put("reservas", reservas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener reservas del libro");
            error.put("detalle", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 🔧 MÉTODO ALTERNATIVO: Eliminación forzada (por si necesitas debugging)
    @DeleteMapping("/{id}/force")
    @Transactional
    public ResponseEntity<?> eliminarLibroForzado(@PathVariable Long id) {
        try {
            System.out.println("🚀 Iniciando eliminación forzada para libro ID: " + id);

            // Verificar existencia
            Optional<Libro> libroOpt = servicio.obtenerPorId(id);
            if (!libroOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Libro libro = libroOpt.get();

            // Obtener información detallada
            List<Reserva> reservasAEliminar = reservaRepository.findByLibroId(id);

            System.out.println("🔍 Información del libro a eliminar:");
            System.out.println("   📚 Título: " + libro.getTitulo());
            System.out.println("   👤 Autor: " + libro.getAutor());
            System.out.println("   🗑️ Reservas asociadas: " + reservasAEliminar.size());

            // Mostrar detalles de cada reserva
            for (Reserva reserva : reservasAEliminar) {
                System.out.println("     - Reserva ID: " + reserva.getId() +
                        ", Usuario: " + reserva.getUsuario().getNombre() +
                        ", Estado: " + reserva.getEstado());
            }

            // Eliminar reservas
            int eliminadas = reservaRepository.deleteByLibroId(id);
            System.out.println("✅ Eliminadas " + eliminadas + " reservas");

            // Eliminar libro
            boolean libroEliminado = servicio.eliminar(id);
            System.out.println("✅ Libro eliminado: " + libroEliminado);

            if (libroEliminado) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("mensaje", "Eliminación forzada completada exitosamente");
                response.put("libro", Map.of(
                        "id", id,
                        "titulo", libro.getTitulo(),
                        "autor", libro.getAutor()
                ));
                response.put("reservasEliminadas", eliminadas);
                response.put("reservasDetalle", reservasAEliminar.stream()
                        .map(r -> Map.of(
                                "id", r.getId(),
                                "usuario", r.getUsuario().getNombre(),
                                "estado", r.getEstado()
                        )).toList());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "No se pudo eliminar el libro después de eliminar las reservas"));
            }

        } catch (Exception e) {
            System.err.println("❌ Error en eliminación forzada: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Error en eliminación forzada",
                            "detalle", e.getMessage()
                    ));
        }
    }
}