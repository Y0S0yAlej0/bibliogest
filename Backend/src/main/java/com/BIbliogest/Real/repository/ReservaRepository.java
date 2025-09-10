package com.BIbliogest.Real.repository;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.model.Reserva;
import com.BIbliogest.Real.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // 📚 Métodos existentes
    List<Reserva> findByUsuario(Usuario usuario);
    List<Reserva> findByUsuarioAndLibroAndEstadoIn(Usuario usuario, Libro libro, List<String> estados);

    // 🔧 NUEVOS MÉTODOS NECESARIOS PARA ELIMINACIÓN EN CASCADA

    // Método 1: Eliminar todas las reservas de un libro específico
    @Modifying
    @Transactional
    @Query("DELETE FROM Reserva r WHERE r.libro.id = :libroId")
    int deleteByLibroId(@Param("libroId") Long libroId);

    // Método 2: Contar reservas de un libro específico (opcional, para logging)
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.libro.id = :libroId")
    long countByLibroId(@Param("libroId") Long libroId);

    // Método 3: Obtener todas las reservas de un libro específico (opcional, para verificación)
    @Query("SELECT r FROM Reserva r WHERE r.libro.id = :libroId")
    List<Reserva> findByLibroId(@Param("libroId") Long libroId);}