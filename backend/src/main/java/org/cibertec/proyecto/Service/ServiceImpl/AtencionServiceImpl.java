package org.cibertec.proyecto.Service.ServiceImpl;

import org.cibertec.proyecto.Entity.Atencion;
import org.cibertec.proyecto.Entity.Ticket;
import org.cibertec.proyecto.Repository.AtencionRepository;
import org.cibertec.proyecto.Repository.TicketRepository;
import org.cibertec.proyecto.Service.AtencionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AtencionServiceImpl extends GenericServiceImpl<Atencion, Integer> implements AtencionService {
    
    @Autowired
    private AtencionRepository atencionRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    public void setRepository(AtencionRepository atencionRepository) {
        this.repository = atencionRepository;
        this.atencionRepository = atencionRepository;
    }
    
    @Override
    public List<Atencion> buscar(String criterio) {
        return atencionRepository.findAll();
    }
    
    @Override
    public List<Atencion> findByClienteId(Integer idCliente) {
        return atencionRepository.findByClienteIdCliente(idCliente);
    }
    
    @Override
    public List<Atencion> findByUsuarioId(Integer idUsuario) {
        return atencionRepository.findByUsuarioIdUsuario(idUsuario);
    }
    
    @Override
    public void remove(Integer id) {
        List<Ticket> tickets = ticketRepository.findAll().stream()
            .filter(ticket -> ticket.getAtencion() != null && ticket.getAtencion().getIdAtencion().equals(id))
            .toList();
        
        for (Ticket ticket : tickets) {
            ticketRepository.delete(ticket);
        }
        super.remove(id);
    }
}