package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.CategoriaLibro;
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
    private JdbcTemplate jdbcTemplate;

    // 🆕 ENDPOINT: Obtener todas las categorías disponibles
    @GetMapping("/categorias")
    public ResponseEntity<?> obtenerCategorias() {
        try {
            String[] categorias = CategoriaLibro.getAllDisplayNames();
            return ResponseEntity.ok(Map.of(
                    "categorias", categorias,
                    "total", categorias.length
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error al obtener categorías",
                    "detalle", e.getMessage()
            ));
        }
    }

    // 🆕 ENDPOINT: Filtrar libros por categoría
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<?> obtenerLibrosPorCategoria(@PathVariable String categoria) {
        try {
            // Normalizar el nombre de la categoría
            String categoriaNormalizada = CategoriaLibro.normalize(categoria);

            if (!CategoriaLibro.isValid(categoriaNormalizada)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Categoría no válida",
                        "categoriaRecibida", categoria,
                        "categoriasDisponibles", CategoriaLibro.getAllDisplayNames()
                ));
            }

            List<Libro> libros = servicio.obtenerPorCategoria(categoriaNormalizada);

            return ResponseEntity.ok(Map.of(
                    "categoria", categoriaNormalizada,
                    "total", libros.size(),
                    "libros", libros
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error al filtrar libros",
                    "detalle", e.getMessage()
            ));
        }
    }

    // 🆕 ENDPOINT: Obtener estadísticas de libros por categoría
    @GetMapping("/estadisticas/categorias")
    public ResponseEntity<?> obtenerEstadisticasCategorias() {
        try {
            String sql = """
                SELECT genero as categoria, COUNT(*) as cantidad
                FROM libro
                GROUP BY genero
                ORDER BY cantidad DESC
            """;

            List<Map<String, Object>> stats = jdbcTemplate.queryForList(sql);

            return ResponseEntity.ok(Map.of(
                    "estadisticas", stats,
                    "totalCategorias", stats.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Error al obtener estadísticas",
                    "detalle", e.getMessage()
            ));
        }
    }

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

    // Crear un nuevo libro (CON VALIDACIÓN DE CATEGORÍA)
    @PostMapping
    public ResponseEntity<?> crearLibro(@RequestBody Libro libro) {
        try {
            // Validar categoría
            String categoria = libro.getGenero();
            if (categoria == null || categoria.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "La categoría es obligatoria",
                        "categoriasDisponibles", CategoriaLibro.getAllDisplayNames()
                ));
            }

            // Normalizar categoría
            String categoriaNormalizada = CategoriaLibro.normalize(categoria);
            if (!CategoriaLibro.isValid(categoriaNormalizada)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Categoría no válida: " + categoria,
                        "categoriasDisponibles", CategoriaLibro.getAllDisplayNames()
                ));
            }

            libro.setGenero(categoriaNormalizada);
            Libro nuevo = servicio.guardar(libro);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Error al guardar el libro",
                    "detalle", e.getMessage()
            ));
        }
    }

    // Actualizar un libro existente por ID (CON VALIDACIÓN DE CATEGORÍA)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarLibro(@PathVariable Long id, @RequestBody Libro libro) {
        try {
            // Validar categoría si se proporciona
            if (libro.getGenero() != null && !libro.getGenero().trim().isEmpty()) {
                String categoriaNormalizada = CategoriaLibro.normalize(libro.getGenero());
                if (!CategoriaLibro.isValid(categoriaNormalizada)) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "Categoría no válida: " + libro.getGenero(),
                            "categoriasDisponibles", CategoriaLibro.getAllDisplayNames()
                    ));
                }
                libro.setGenero(categoriaNormalizada);
            }

            Optional<Libro> actualizado = servicio.actualizar(id, libro);
            return actualizado.isPresent()
                    ? ResponseEntity.ok(actualizado.get())
                    : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Error al actualizar el libro",
                    "detalle", e.getMessage()
            ));
        }
    }

    // Eliminar un libro por id
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> eliminarLibro(@PathVariable Long id) {
        try {
            System.out.println("🚀 Iniciando eliminación con JDBC directo para libro ID: " + id);

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

            String sqlContarReservas = "SELECT COUNT(*) FROM reservas WHERE libro_id = ?";
            Integer reservasCount = jdbcTemplate.queryForObject(sqlContarReservas, Integer.class, id);

            System.out.println("📊 Reservas encontradas: " + reservasCount);

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

            int reservasEliminadas = 0;
            if (reservasCount > 0) {
                String sqlEliminarReservas = "DELETE FROM reservas WHERE libro_id = ?";
                reservasEliminadas = jdbcTemplate.update(sqlEliminarReservas, id);
                System.out.println("✅ Eliminadas " + reservasEliminadas + " reservas usando JDBC directo");
            }

            String sqlEliminarLibro = "DELETE FROM libro WHERE id = ?";
            int librosEliminados = jdbcTemplate.update(sqlEliminarLibro, id);

            if (librosEliminados > 0) {
                System.out.println("✅ ELIMINACIÓN COMPLETADA: '" + titulo + "' (ID: " + id + ")");

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("mensaje", "✅ Libro y reservas eliminados exitosamente");

                response.put("libroEliminado", Map.of(
                        "id", id,
                        "titulo", titulo,
                        "autor", autor
                ));

                response.put("estadisticas", Map.of(
                        "reservasEncontradas", reservasCount,
                        "reservasEliminadas", reservasEliminadas,
                        "librosEliminados", librosEliminados
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
            System.err.println("❌ ERROR: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Error al eliminar",
                    "detalle", e.getMessage()
            ));
        }
    }

    @GetMapping("/aleatorios")
    public ResponseEntity<?> obtenerLibrosAleatorios(@RequestParam(defaultValue = "8") int cantidad) {
        try {
            List<Libro> todosLosLibros = servicio.obtenerTodos();

            if (todosLosLibros.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            List<Libro> librosAleatorios = new java.util.ArrayList<>(todosLosLibros);
            java.util.Collections.shuffle(librosAleatorios);

            int cantidadFinal = Math.min(cantidad, librosAleatorios.size());
            List<Libro> resultado = librosAleatorios.subList(0, cantidadFinal);

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

                        boolean disponible = "Disponible".equalsIgnoreCase(libro.getEstado())
                                && libro.getCantidad() != null
                                && libro.getCantidad() > 0;
                        libroMap.put("disponible", disponible);

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