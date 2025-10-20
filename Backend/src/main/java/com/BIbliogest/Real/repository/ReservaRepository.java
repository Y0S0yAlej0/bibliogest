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

    // 🆕 NUEVO MÉTODO: Buscar reservas de un usuario con estados específicos (sin filtrar por libro)
    List<Reserva> findByUsuarioAndEstadoIn(Usuario usuario, List<String> estados);

    // 🔧 MÉTODOS CORREGIDOS PARA ELIMINACIÓN EN CASCADA

    // ✅ Método 1: Obtener todas las reservas de un libro específico (SEGURO)
    @Query("SELECT r FROM Reserva r WHERE r.libro.id = :libroId")
    List<Reserva> findByLibroId(@Param("libroId") Long libroId);

    // ✅ Método 2: Contar reservas de un libro específico (SEGURO)
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.libro.id = :libroId")
    long countByLibroId(@Param("libroId") Long libroId);

    // ✅ Método 3: Eliminar usando SQL nativo (más directo)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM reservas WHERE libro_id = :libroId", nativeQuery = true)
    int deleteByLibroIdNative(@Param("libroId") Long libroId);

    // ✅ Método 4: Marcar reservas como eliminadas en lugar de borrarlas físicamente (alternativa)
    @Modifying
    @Transactional
    @Query("UPDATE Reserva r SET r.estado = 'eliminada' WHERE r.libro.id = :libroId")
    int markAsDeletedByLibroId(@Param("libroId") Long libroId);

    // 🔧 Método 5: Para obtener reservas de un libro específico con información completa
    @Query("SELECT r FROM Reserva r JOIN FETCH r.usuario JOIN FETCH r.libro WHERE r.libro.id = :libroId")
    List<Reserva> findByLibroIdWithDetails(@Param("libroId") Long libroId);
}