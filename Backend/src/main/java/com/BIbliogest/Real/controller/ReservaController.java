package com.BIbliogest.Real.controller;

import com.BIbliogest.Real.model.Reserva;
import com.BIbliogest.Real.service.ReservaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    // 1. Crear una reserva
    @PostMapping
    public ResponseEntity<Reserva> crearReserva(@RequestParam Long usuarioId,
                                                @RequestParam Long libroId) {
        Reserva reserva = reservaService.crearReserva(usuarioId, libroId);
        return ResponseEntity.ok(reserva);
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
}
