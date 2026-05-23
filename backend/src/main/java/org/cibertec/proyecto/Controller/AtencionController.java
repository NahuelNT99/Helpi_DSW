package org.cibertec.proyecto.Controller;

import org.cibertec.proyecto.Entity.Atencion;
import org.cibertec.proyecto.Entity.Cliente;
import org.cibertec.proyecto.Service.AtencionService;
import org.cibertec.proyecto.Service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atenciones")
@CrossOrigin(origins = "*")
public class AtencionController {
    
    @Autowired
    private AtencionService atencionService;

    @Autowired
    private ClienteService clienteService;
    
    @GetMapping
    public ResponseEntity<List<Atencion>> getAllAtenciones() {
        List<Atencion> atenciones = atencionService.getAll();
        return ResponseEntity.ok(atenciones);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Atencion> getAtencionById(@PathVariable Integer id) {
        Atencion atencion = atencionService.getById(id);
        return ResponseEntity.ok(atencion);
    }
    
    @PostMapping
    public ResponseEntity<Object> createAtencion(@RequestBody Atencion atencion) {
        atencionService.create(atencion);
        return ResponseEntity.ok(java.util.Collections.singletonMap("idAtencion", atencion.getIdAtencion()));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateAtencion(@PathVariable Integer id, @RequestBody Atencion atencion) {
        atencion.setIdAtencion(id);
        atencionService.modify(atencion);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Atención actualizada exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteAtencion(@PathVariable Integer id) {
        atencionService.remove(id);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Atención eliminada exitosamente"));
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<Atencion>> buscarAtenciones(@RequestParam String criterio) {
        List<Atencion> atenciones = atencionService.buscar(criterio);
        return ResponseEntity.ok(atenciones);
    }
    
    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Atencion>> getAtencionesByClienteId(@PathVariable Integer idCliente) {
        List<Atencion> atencionesCliente = atencionService.findByClienteId(idCliente);
        return ResponseEntity.ok(atencionesCliente);
    }
    
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Atencion>> getAtencionesByUsuarioId(@PathVariable Integer idUsuario) {
        List<Atencion> atencionesUsuario = atencionService.findByUsuarioId(idUsuario);
        return ResponseEntity.ok(atencionesUsuario);
    }
    
    @GetMapping("/historial-llamadas/{dni}")
    public ResponseEntity<List<Atencion>> getHistorialByDni(@PathVariable String dni) {
        try {
            List<Cliente> clientes = clienteService.getAll();
            Cliente cliente = clientes.stream()
                .filter(c -> c.getDni() != null && c.getDni().equals(dni))
                .findFirst()
                .orElse(null);
            
            if (cliente != null) {
                List<Atencion> atencionesCliente = atencionService.findByClienteId(cliente.getIdCliente());
                return ResponseEntity.ok(atencionesCliente);
            } else {
                return ResponseEntity.ok(List.of());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}