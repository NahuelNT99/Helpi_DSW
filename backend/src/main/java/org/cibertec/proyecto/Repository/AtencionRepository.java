package org.cibertec.proyecto.Repository;

import org.cibertec.proyecto.Entity.Atencion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AtencionRepository extends JpaRepository<Atencion, Integer> {
    List<Atencion> findByClienteIdCliente(Integer idCliente);
    List<Atencion> findByUsuarioIdUsuario(Integer idUsuario);
}