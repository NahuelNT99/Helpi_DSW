package org.cibertec.proyecto.Service.ServiceImpl;

import org.cibertec.proyecto.Entity.Ticket;
import org.cibertec.proyecto.Repository.TicketRepository;
import org.cibertec.proyecto.Service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketServiceImpl extends GenericServiceImpl<Ticket, Integer> implements TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    public void setRepository(TicketRepository ticketRepository) {
        this.repository = ticketRepository;
        this.ticketRepository = ticketRepository;
    }
    
    @Override
    public List<Ticket> buscar(String criterio) {
        return ticketRepository.findAll();
    }
    
    @Override
    public List<Ticket> findByTecnicoId(Integer idTecnico) {
        return ticketRepository.findByTecnicoIdUsuario(idTecnico);
    }
}