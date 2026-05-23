package org.cibertec.proyecto.Service;

import org.cibertec.proyecto.Entity.Atencion;

import java.util.List;

public interface AtencionService extends GenericService<Atencion, Integer> {
    List<Atencion> findByClienteId(Integer idCliente);
    List<Atencion> findByUsuarioId(Integer idUsuario);
}