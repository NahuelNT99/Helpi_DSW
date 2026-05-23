package org.cibertec.proyecto.Controller;

import org.cibertec.proyecto.Entity.Cliente;
import org.cibertec.proyecto.Service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {
    
    @Autowired
    private ClienteService clienteService;
    
    @GetMapping
    public ResponseEntity<List<Cliente>> getAllClientes() {
        List<Cliente> clientes = clienteService.getAll();
        return ResponseEntity.ok(clientes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getClienteById(@PathVariable Integer id) {
        Cliente cliente = clienteService.getById(id);
        return ResponseEntity.ok(cliente);
    }
    
    @PostMapping
    public ResponseEntity<Object> createCliente(@RequestBody Cliente cliente) {
        clienteService.create(cliente);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Cliente creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateCliente(@PathVariable Integer id, @RequestBody Cliente cliente) {
        cliente.setIdCliente(id);
        clienteService.modify(cliente);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Cliente actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteCliente(@PathVariable Integer id) {
        clienteService.remove(id);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Cliente eliminado exitosamente"));
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<Cliente>> buscarClientes(@RequestParam String criterio) {
        List<Cliente> clientes = clienteService.buscar(criterio);
        return ResponseEntity.ok(clientes);
    }
    
    @GetMapping("/dni/{dni}")
    public ResponseEntity<Cliente> getClienteByDni(@PathVariable String dni) {
        Cliente cliente = clienteService.findByDni(dni);
        if (cliente != null) {
            return ResponseEntity.ok(cliente);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}