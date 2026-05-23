package org.cibertec.proyecto.Repository;

import org.cibertec.proyecto.Entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
	Cliente findTopByOrderByIdClienteDesc();
	Cliente findByDni(String dni);
}