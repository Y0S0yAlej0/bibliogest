package com.BIbliogest.Real.repository;

import com.BIbliogest.Real.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LibroRepository extends JpaRepository<Libro, Long> {
}