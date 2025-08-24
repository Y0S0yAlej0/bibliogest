package com.BIbliogest.Real.service;

import org.springframework.transaction.annotation.Transactional;
import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.model.Reserva;
import com.BIbliogest.Real.model.Usuario;
import com.BIbliogest.Real.repository.LibroRepository;
import com.BIbliogest.Real.repository.ReservaRepository;
import com.BIbliogest.Real.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          LibroRepository libroRepository,
                          UsuarioRepository usuarioRepository) {
        this.reservaRepository = reservaRepository;
        this.libroRepository = libroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Crear una nueva reserva para un usuario
     */
    public Reserva crearReserva(Long libroId, Long usuarioId) {
        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar si ya tiene una reserva activa de este libro
        List<Reserva> reservasActivas = reservaRepository.findByUsuarioAndLibroAndEstadoIn(
                usuario, libro, Arrays.asList("pendiente", "aprobada")
        );

        if (!reservasActivas.isEmpty()) {
            throw new RuntimeException("Ya tienes una reserva activa para este libro");
        }

        if (libro.getCantidad() <= 0) {
            throw new RuntimeException("No hay ejemplares disponibles");
        }

        Reserva reserva = new Reserva();
        reserva.setLibro(libro);
        reserva.setUsuario(usuario);
        reserva.setEstado("pendiente");

        return reservaRepository.save(reserva);
    }

    /**
     * Listar todas las reservas (solo admin)
     */
    public List<Reserva> listarReservas() {
        return reservaRepository.findAll();
    }

    /**
     * Listar reservas de un usuario en específico
     */
    public List<Reserva> listarReservasPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return reservaRepository.findByUsuario(usuario);
    }

    /**
     * Cambiar el estado de una reserva (aprobada, rechazada, pendiente)
     */
    @Transactional
    public Reserva cambiarEstado(Long reservaId, String nuevoEstado) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        Libro libro = reserva.getLibro();

        if (nuevoEstado.equalsIgnoreCase("aprobada")) {
            if (libro.getCantidad() <= 0) {
                throw new RuntimeException("No hay ejemplares disponibles para este libro");
            }

            // 🆕 Usar el método aprobar() que establece las fechas automáticamente
            reserva.aprobar();

            libro.setCantidad(libro.getCantidad() - 1);
            if (libro.getCantidad() == 0) {
                libro.setEstado("agotado");
            }
            libroRepository.save(libro);
        } else {
            reserva.setEstado(nuevoEstado);
        }

        return reservaRepository.save(reserva);
    }

    /**
     * Devolver un libro (solo reservas aprobadas)
     */
    @Transactional
    public void devolverLibro(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!reserva.getEstado().equalsIgnoreCase("aprobada")) {
            throw new RuntimeException("Solo se pueden devolver reservas aprobadas");
        }

        Libro libro = reserva.getLibro();
        libro.setCantidad(libro.getCantidad() + 1);

        // Si hay unidades otra vez → marcar disponible
        if (libro.getCantidad() > 0) {
            libro.setEstado("disponible");
        }

        libroRepository.save(libro);

        // Cambiar estado de la reserva a devuelta
        reserva.setEstado("devuelta");
        reservaRepository.save(reserva);
    }

    /**
     * 🆕 Método para marcar reservas vencidas automáticamente
     * Se ejecuta cada día a las 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void marcarReservasVencidas() {
        LocalDateTime ahora = LocalDateTime.now();

        List<Reserva> reservasAprobadas = reservaRepository.findAll().stream()
                .filter(r -> "aprobada".equalsIgnoreCase(r.getEstado()))
                .filter(r -> r.getFechaLimiteDevolucion() != null)
                .filter(r -> ahora.isAfter(r.getFechaLimiteDevolucion()))
                .toList();

        for (Reserva reserva : reservasAprobadas) {
            reserva.setEstado("vencida");
            reservaRepository.save(reserva);
        }

        if (!reservasAprobadas.isEmpty()) {
            System.out.println("✅ Se marcaron " + reservasAprobadas.size() + " reservas como vencidas");
        }
    }

    /**
     * 🆕 Obtener reservas próximas a vencer (menos de 3 días)
     */
    public List<Reserva> getReservasProximasAVencer(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return reservaRepository.findByUsuario(usuario).stream()
                .filter(r -> "aprobada".equalsIgnoreCase(r.getEstado()))
                .filter(r -> r.getDiasRestantes() <= 3 && r.getDiasRestantes() > 0)
                .toList();
    }

    /**
     * 🆕 Obtener reservas vencidas de un usuario
     */
    public List<Reserva> getReservasVencidas(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return reservaRepository.findByUsuario(usuario).stream()
                .filter(Reserva::estaVencida)
                .toList();
    }
}