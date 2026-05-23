package org.cibertec.proyecto.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "categorias_atencion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaAtencion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Integer idCategoria;
    
    @Column(name = "nombre_categoria", nullable = false, length = 50)
    private String nombreCategoria;
}