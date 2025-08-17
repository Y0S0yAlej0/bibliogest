package com.BIbliogest.Real.repository;

import com.BIbliogest.Real.model.Libro;
import com.BIbliogest.Real.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.BIbliogest.Real.model.Reserva;
import com.BIbliogest.Real.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByUsuario(Usuario usuario);
    List<Reserva> findByUsuarioAndLibroAndEstadoIn(Usuario usuario, Libro libro, List<String> estados);
}
