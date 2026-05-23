package org.cibertec.proyecto.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;
    
    @Column(name = "numero_cliente", unique = true, nullable = false, length = 20)
    private String numeroCliente;
    
    @Column(name = "dni", unique = true, nullable = false, length = 8)
    private String dni;
    
    @Column(name = "nombre_completo", nullable = false, length = 100)
    private String nombreCompleto;
    
    @Column(name = "tipo_plan", length = 50)
    private String tipoPlan;
    
    @Column(name = "costo_plan", precision = 10, scale = 2)
    private BigDecimal costoPlan;
    
    @Column(name = "estado_servicio", length = 50)
    private String estadoServicio;
    
    @Column(name = "correo", length = 100)
    private String correo;
    
    @Column(name = "telefono", length = 20)
    private String telefono;
}