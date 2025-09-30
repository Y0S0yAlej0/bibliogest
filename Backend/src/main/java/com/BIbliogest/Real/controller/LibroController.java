package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.service.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class LibroController {

    @Autowired
    private LibroService servicio;

    @Autowired
    private JdbcTemplate jdbcTemplate; // Para operaciones SQL directas

    // Obtener todos los libros
    @GetMapping
    public List<Libro> obtenerLibros() {
        return servicio.obtenerTodos();
    }

    // Obtener un libro específico por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerLibroPorId(@PathVariable Long id) {
        try {
            Optional<Libro> libro = servicio.obtenerPorId(id);
            if (libro.isPresent()) {
                return ResponseEntity.ok(libro.get());
            } else {
                return ResponseEntity.status(404).body("❌ Libro no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al obtener libro ID " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).body("Error interno del servidor");
        }
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


    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> eliminarLibro(@PathVariable Long id) {
        try {
            System.out.println("🚀 Iniciando eliminación con JDBC directo para libro ID: " + id);

            // 🔍 PASO 1: Verificar que el libro existe usando JDBC directo
            String sqlVerificar = "SELECT id, titulo, autor FROM libro WHERE id = ?";
            List<Map<String, Object>> libros = jdbcTemplate.queryForList(sqlVerificar, id);

            if (libros.isEmpty()) {
                System.out.println("❌ Libro no encontrado: ID " + id);
                return ResponseEntity.status(404).body("❌ Libro no encontrado para eliminar.");
            }

            Map<String, Object> libroData = libros.get(0);
            String titulo = (String) libroData.get("titulo");
            String autor = (String) libroData.get("autor");

            System.out.println("📚 Libro encontrado: '" + titulo + "' por " + autor);

            // 🔍 PASO 2: Obtener información de reservas usando JDBC directo
            String sqlContarReservas = "SELECT COUNT(*) FROM reservas WHERE libro_id = ?";
            Integer reservasCount = jdbcTemplate.queryForObject(sqlContarReservas, Integer.class, id);

            System.out.println("📊 Reservas encontradas: " + reservasCount);

            // Obtener detalles de las reservas antes de eliminar
            String sqlDetalleReservas = """
                SELECT r.id, r.estado, r.fecha_reserva, u.nombre 
                FROM reservas r 
                JOIN usuario u ON r.usuario_id = u.id 
                WHERE r.libro_id = ?
            """;

            List<Map<String, Object>> reservasDetalle = jdbcTemplate.queryForList(sqlDetalleReservas, id);

            for (Map<String, Object> reserva : reservasDetalle) {
                System.out.println("   - Reserva ID: " + reserva.get("id") +
                        " | Usuario: " + reserva.get("nombre") +
                        " | Estado: " + reserva.get("estado"));
            }

            // 🗑️ PASO 3: Eliminar reservas usando JDBC directo (sin Hibernate)
            int reservasEliminadas = 0;
            if (reservasCount > 0) {
                String sqlEliminarReservas = "DELETE FROM reservas WHERE libro_id = ?";
                reservasEliminadas = jdbcTemplate.update(sqlEliminarReservas, id);
                System.out.println("✅ Eliminadas " + reservasEliminadas + " reservas usando JDBC directo");
            }

            // 🗑️ PASO 4: Eliminar el libro usando JDBC directo
            String sqlEliminarLibro = "DELETE FROM libro WHERE id = ?";
            int librosEliminados = jdbcTemplate.update(sqlEliminarLibro, id);

            if (librosEliminados > 0) {
                System.out.println("✅ ELIMINACIÓN COMPLETADA: '" + titulo + "' (ID: " + id + ")");

                // 📤 Respuesta de éxito
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("mensaje", "✅ Libro y reservas eliminados exitosamente usando JDBC directo");

                response.put("libroEliminado", Map.of(
                        "id", id,
                        "titulo", titulo,
                        "autor", autor
                ));

                response.put("estadisticas", Map.of(
                        "reservasEncontradas", reservasCount,
                        "reservasEliminadas", reservasEliminadas,
                        "librosEliminados", librosEliminados,
                        "metodo", "JDBC_DIRECTO"
                ));

                response.put("reservasEliminadas", reservasDetalle);

                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ No se pudo eliminar el libro");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "success", false,
                        "error", "No se pudo eliminar el libro",
                        "reservasEliminadas", reservasEliminadas
                ));
            }

        } catch (Exception e) {
            System.err.println("❌ ERROR con JDBC directo: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Error al eliminar con JDBC directo",
                    "detalle", e.getMessage(),
                    "tipo", e.getClass().getSimpleName()
            ));
        }
    }

    // 🔧 MÉTODO AUXILIAR: Ver reservas con JDBC directo
    @GetMapping("/{id}/reservas")
    public ResponseEntity<?> obtenerReservasDeLibro(@PathVariable Long id) {
        try {
            // Verificar libro
            String sqlLibro = "SELECT id, titulo, autor FROM libro WHERE id = ?";
            List<Map<String, Object>> libros = jdbcTemplate.queryForList(sqlLibro, id);

            if (libros.isEmpty()) {
                return ResponseEntity.status(404).body("❌ Libro no encontrado");
            }

            Map<String, Object> libro = libros.get(0);

            // Obtener reservas
            String sqlReservas = """
                SELECT r.id, r.estado, r.fecha_reserva, r.fecha_aprobacion, 
                       u.id as usuario_id, u.nombre as usuario_nombre
                FROM reservas r 
                JOIN usuario u ON r.usuario_id = u.id 
                WHERE r.libro_id = ?
                ORDER BY r.fecha_reserva DESC
            """;

            List<Map<String, Object>> reservas = jdbcTemplate.queryForList(sqlReservas, id);

            Map<String, Object> response = new HashMap<>();
            response.put("libroId", id);
            response.put("titulo", libro.get("titulo"));
            response.put("autor", libro.get("autor"));
            response.put("totalReservas", reservas.size());
            response.put("reservas", reservas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al obtener reservas",
                    "detalle", e.getMessage()
            ));
        }
    }

    // 🔧 MÉTODO DEBUG: Estado completo usando JDBC
    @GetMapping("/{id}/debug-jdbc")
    public ResponseEntity<?> debugLibroJdbc(@PathVariable Long id) {
        try {
            Map<String, Object> debug = new HashMap<>();

            // Verificar libro
            String sqlLibro = "SELECT * FROM libro WHERE id = ?";
            List<Map<String, Object>> libros = jdbcTemplate.queryForList(sqlLibro, id);

            debug.put("libroExiste", !libros.isEmpty());
            if (!libros.isEmpty()) {
                debug.put("libro", libros.get(0));
            }

            // Contar reservas
            String sqlContar = "SELECT COUNT(*) FROM reservas WHERE libro_id = ?";
            Integer totalReservas = jdbcTemplate.queryForObject(sqlContar, Integer.class, id);
            debug.put("totalReservas", totalReservas);

            // Detalles de reservas
            String sqlReservas = """
                SELECT r.*, u.nombre as usuario_nombre 
                FROM reservas r 
                LEFT JOIN usuario u ON r.usuario_id = u.id 
                WHERE r.libro_id = ?
            """;
            List<Map<String, Object>> reservas = jdbcTemplate.queryForList(sqlReservas, id);
            debug.put("reservasDetalle", reservas);

            return ResponseEntity.ok(debug);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error en debug JDBC",
                    "detalle", e.getMessage()
            ));
        }
    }

    // 🧪 MÉTODO DE PRUEBA: Eliminar solo reservas
    @DeleteMapping("/{id}/solo-reservas")
    @Transactional
    public ResponseEntity<?> eliminarSoloReservas(@PathVariable Long id) {
        try {
            System.out.println("🧪 Eliminando solo reservas del libro ID: " + id);

            String sql = "DELETE FROM reservas WHERE libro_id = ?";
            int eliminadas = jdbcTemplate.update(sql, id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "mensaje", "Reservas eliminadas exitosamente",
                    "reservasEliminadas", eliminadas,
                    "metodo", "JDBC_DIRECTO"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error eliminando solo reservas",
                    "detalle", e.getMessage()
            ));
        }
    }

    @GetMapping("/aleatorios")
    public ResponseEntity<?> obtenerLibrosAleatorios(@RequestParam(defaultValue = "8") int cantidad) {
        try {
            System.out.println("🔄 Solicitando " + cantidad + " libros aleatorios...");

            // Obtener todos los libros
            List<Libro> todosLosLibros = servicio.obtenerTodos();

            System.out.println("📚 Total de libros en BD: " + todosLosLibros.size());

            if (todosLosLibros.isEmpty()) {
                System.out.println("⚠️ No hay libros en la base de datos");
                return ResponseEntity.ok(List.of()); // Retornar lista vacía si no hay libros
            }

            // Mezclar la lista aleatoriamente
            List<Libro> librosAleatorios = new java.util.ArrayList<>(todosLosLibros);
            java.util.Collections.shuffle(librosAleatorios);

            // Tomar solo la cantidad solicitada
            int cantidadFinal = Math.min(cantidad, librosAleatorios.size());
            List<Libro> resultado = librosAleatorios.subList(0, cantidadFinal);

            System.out.println("✅ Devolviendo " + resultado.size() + " libros aleatorios");

            // Mapear a un formato más ligero
            List<Map<String, Object>> librosSimplificados = resultado.stream()
                    .map(libro -> {
                        Map<String, Object> libroMap = new HashMap<>();
                        libroMap.put("id", libro.getId());
                        libroMap.put("titulo", libro.getTitulo());
                        libroMap.put("autor", libro.getAutor());
                        libroMap.put("imagen", libro.getImagen());
                        libroMap.put("estado", libro.getEstado());
                        libroMap.put("cantidad", libro.getCantidad());
                        libroMap.put("genero", libro.getGenero());
                        libroMap.put("sinopsis", libro.getSinopsis());

                        // Determinar disponibilidad
                        boolean disponible = "Disponible".equalsIgnoreCase(libro.getEstado())
                                && libro.getCantidad() != null
                                && libro.getCantidad() > 0;
                        libroMap.put("disponible", disponible);

                        System.out.println("   📖 " + libro.getTitulo() + " - " + (disponible ? "✓" : "✗"));

                        return libroMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(librosSimplificados);

        } catch (Exception e) {
            System.err.println("❌ Error al obtener libros aleatorios: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Error al obtener libros aleatorios",
                            "detalle", e.getMessage()
                    ));
        }
    }

}