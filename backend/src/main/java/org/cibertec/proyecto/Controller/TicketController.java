package org.cibertec.proyecto.Controller;

import org.cibertec.proyecto.Entity.Atencion;
import org.cibertec.proyecto.Entity.Ticket;
import org.cibertec.proyecto.Service.AtencionService;
import org.cibertec.proyecto.Service.TicketService;
import org.cibertec.proyecto.Entity.CategoriaAtencion;
import org.cibertec.proyecto.Repository.CategoriaAtencionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;

    @Autowired
    private AtencionService atencionService;

    @Autowired
    private CategoriaAtencionRepository categoriaAtencionRepository;
    
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAll();
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Integer id) {
        Ticket ticket = ticketService.getById(id);
        return ResponseEntity.ok(ticket);
    }
    

    @PostMapping
    public ResponseEntity<Object> createTicket(@RequestBody Ticket ticket) {
        if (ticket.getCategoria() != null && ticket.getCategoria().getIdCategoria() != null) {
            CategoriaAtencion categoria = categoriaAtencionRepository.findById(ticket.getCategoria().getIdCategoria())
                .orElse(null);
            ticket.setCategoria(categoria);
        } else {
            ticket.setCategoria(null);
        }
        ticketService.create(ticket);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Ticket creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateTicket(@PathVariable Integer id, @RequestBody Ticket ticketDetails) {
        try {
            System.out.println("=== UPDATING TICKET ===");
            System.out.println("Ticket ID: " + id);
            System.out.println("Received payload:");
            System.out.println("- Descripcion Problema: " + ticketDetails.getDescripcionProblema());
            System.out.println("- Prioridad: " + ticketDetails.getPrioridad());
            System.out.println("- Estado: " + ticketDetails.getEstadoTicket());
            System.out.println("- Categoria: " + (ticketDetails.getCategoria() != null ? ticketDetails.getCategoria().getIdCategoria() : "null"));
            System.out.println("- Tecnico: " + (ticketDetails.getTecnico() != null ? ticketDetails.getTecnico().getIdUsuario() : "null"));
            System.out.println("- Atencion: " + (ticketDetails.getAtencion() != null ? "present" : "null"));
            
            Ticket existingTicket = ticketService.getById(id);
            System.out.println("Found existing ticket: " + existingTicket.getIdTicket());

            CategoriaAtencion newCategoria = null;
            if (ticketDetails.getCategoria() != null && ticketDetails.getCategoria().getIdCategoria() != null) {
                newCategoria = categoriaAtencionRepository.findById(ticketDetails.getCategoria().getIdCategoria())
                    .orElse(null);
                System.out.println("New category: " + (newCategoria != null ? newCategoria.getNombreCategoria() : "null"));
            }

            existingTicket.setCategoria(newCategoria);
            existingTicket.setDescripcionProblema(ticketDetails.getDescripcionProblema());

            if (ticketDetails.getPrioridad() != null) {
                existingTicket.setPrioridad(ticketDetails.getPrioridad());
            }
            
            existingTicket.setEstadoTicket(ticketDetails.getEstadoTicket());

            if (ticketDetails.getTecnico() != null && ticketDetails.getTecnico().getIdUsuario() != null) {
                existingTicket.setTecnico(ticketDetails.getTecnico());
            }

            Atencion atencion = existingTicket.getAtencion();
            if (atencion != null) {
                System.out.println("Updating atencion: " + atencion.getIdAtencion());
                atencion.setCategoria(newCategoria);

                if (ticketDetails.getAtencion() != null && ticketDetails.getAtencion().getDescripcion() != null) {
                    atencion.setDescripcion(ticketDetails.getAtencion().getDescripcion());
                    System.out.println("Updated atencion description: " + ticketDetails.getAtencion().getDescripcion());
                }
                
                atencionService.modify(atencion);
            }

            System.out.println("Saving ticket modifications...");
            ticketService.modify(existingTicket);
            System.out.println("Ticket updated successfully");

            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Ticket actualizado exitosamente"));
        } catch (Exception e) {
            System.err.println("Error updating ticket: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(java.util.Collections.singletonMap("error", "Error al actualizar ticket: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteTicket(@PathVariable Integer id) {
        ticketService.remove(id);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Ticket eliminado exitosamente"));
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<Ticket>> buscarTickets(@RequestParam String criterio) {
        List<Ticket> tickets = ticketService.buscar(criterio);
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/tecnico/{idTecnico}")
    public ResponseEntity<List<Ticket>> getTicketsByTecnico(@PathVariable Integer idTecnico) {
        List<Ticket> tickets = ticketService.findByTecnicoId(idTecnico);
        return ResponseEntity.ok(tickets);
    }
}