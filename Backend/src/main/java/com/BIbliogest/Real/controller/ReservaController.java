package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.dto.ReservaRequest;
import com.BIbliogest.Real.model.Reserva;
import com.BIbliogest.Real.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    // 1. Crear una reserva
    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody ReservaRequest request) {
        try {
            Reserva reserva = reservaService.crearReserva(request.getLibroId(), request.getUsuarioId());
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Listar TODAS las reservas (solo admin)
    @GetMapping
    public ResponseEntity<List<Reserva>> listarReservas() {
        return ResponseEntity.ok(reservaService.listarReservas());
    }

    // 3. Listar reservas de un usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Reserva>> listarReservasPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(reservaService.listarReservasPorUsuario(usuarioId));
    }

    // 4. Aprobar una reserva
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<Reserva> aprobarReserva(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.cambiarEstado(id, "aprobada"));
    }

    // 5. Rechazar una reserva
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Reserva> rechazarReserva(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.cambiarEstado(id, "rechazada"));
    }

    // 6. Devolver un libro
    @PutMapping("/{id}/devolver")
    public ResponseEntity<String> devolverLibro(@PathVariable Long id) {
        try {
            reservaService.devolverLibro(id);
            return ResponseEntity.ok("Libro devuelto correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 🆕 7. Obtener reservas próximas a vencer de un usuario
    @GetMapping("/usuario/{usuarioId}/proximas-vencer")
    public ResponseEntity<List<Reserva>> getReservasProximasAVencer(@PathVariable Long usuarioId) {
        try {
            List<Reserva> reservas = reservaService.getReservasProximasAVencer(usuarioId);
            return ResponseEntity.ok(reservas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 🆕 8. Obtener reservas vencidas de un usuario
    @GetMapping("/usuario/{usuarioId}/vencidas")
    public ResponseEntity<List<Reserva>> getReservasVencidas(@PathVariable Long usuarioId) {
        try {
            List<Reserva> reservas = reservaService.getReservasVencidas(usuarioId);
            return ResponseEntity.ok(reservas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 🆕 9. Marcar reservas vencidas manualmente (para pruebas o admin)
    @PostMapping("/marcar-vencidas")
    public ResponseEntity<String> marcarReservasVencidas() {
        reservaService.marcarReservasVencidas();
        return ResponseEntity.ok("Proceso de marcado de reservas vencidas completado");
    }
}