package org.cibertec.proyecto.Repository;

import org.cibertec.proyecto.Entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findByTecnicoIdUsuario(Integer idTecnico);
}