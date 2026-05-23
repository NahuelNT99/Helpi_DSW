package org.cibertec.proyecto.Controller;

import org.cibertec.proyecto.Entity.CategoriaAtencion;
import org.cibertec.proyecto.Repository.CategoriaAtencionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-atencion")
@CrossOrigin(origins = "*")
public class CategoriaAtencionController {
    @Autowired
    private CategoriaAtencionRepository categoriaAtencionRepository;

    @GetMapping
    public ResponseEntity<List<CategoriaAtencion>> getAllCategorias() {
        List<CategoriaAtencion> categorias = categoriaAtencionRepository.findAll();
        return ResponseEntity.ok(categorias);
    }
}
