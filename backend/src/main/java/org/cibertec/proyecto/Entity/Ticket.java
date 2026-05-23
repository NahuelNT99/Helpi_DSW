package org.cibertec.proyecto.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Integer idTicket;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_atencion")
    private Atencion atencion;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tecnico")
    private Usuario tecnico;
    
    @Column(name = "descripcion_problema", nullable = false, columnDefinition = "TEXT")
    private String descripcionProblema;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "prioridad")
    private Prioridad prioridad;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria")
    private CategoriaAtencion categoria;
    
    @Column(name = "estado_ticket", length = 20)
    private String estadoTicket = "Pendiente";
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;
    
    public enum Prioridad {
        Alta, Media, Baja
    }
}