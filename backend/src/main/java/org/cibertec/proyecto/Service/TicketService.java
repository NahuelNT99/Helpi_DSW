package org.cibertec.proyecto.Service;

import org.cibertec.proyecto.Entity.Ticket;
import java.util.List;

public interface TicketService extends GenericService<Ticket, Integer> {
    List<Ticket> findByTecnicoId(Integer idTecnico);
}