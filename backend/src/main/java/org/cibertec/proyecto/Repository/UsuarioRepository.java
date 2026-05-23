package org.cibertec.proyecto.Repository;

import org.cibertec.proyecto.Entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByUsuarioLogin(String usuarioLogin);
}