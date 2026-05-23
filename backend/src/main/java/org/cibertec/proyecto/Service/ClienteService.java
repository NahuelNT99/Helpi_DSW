package org.cibertec.proyecto.Service;

import org.cibertec.proyecto.Entity.Cliente;

public interface ClienteService extends GenericService<Cliente, Integer> {
    Cliente findByDni(String dni);
}