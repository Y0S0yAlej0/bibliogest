package com.BIbliogest.Real.repository;

import com.BIbliogest.Real.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
