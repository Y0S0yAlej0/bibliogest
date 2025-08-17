package com.BIbliogest.Real.service;
import org.springframework.transaction.annotation.Transactional;
import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.model.Reserva;
import com.BIbliogest.Real.model.Usuario;
import com.BIbliogest.Real.repository.LibroRepository;
import com.BIbliogest.Real.repository.ReservaRepository;
import com.BIbliogest.Real.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

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


    @Transactional  // ← Agregar esta anotación
    public Reserva cambiarEstado(Long reservaId, String nuevoEstado) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        Libro libro = reserva.getLibro();

        if (nuevoEstado.equalsIgnoreCase("aprobada")) {
            if (libro.getCantidad() <= 0) {
                throw new RuntimeException("No hay ejemplares disponibles para este libro");
            }

            libro.setCantidad(libro.getCantidad() - 1);

            if (libro.getCantidad() == 0) {
                libro.setEstado("agotado");
            }

            libroRepository.save(libro);
        }

        reserva.setEstado(nuevoEstado);
        return reservaRepository.save(reserva);
    }
    /**
     * Devolver un libro (solo reservas aprobadas)
     */
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
}
