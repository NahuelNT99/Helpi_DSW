package org.cibertec.proyecto.Controller;

import org.cibertec.proyecto.Entity.Usuario;
import org.cibertec.proyecto.Service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.getAll();
        return ResponseEntity.ok(usuarios);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Integer id) {
        Usuario usuario = usuarioService.getById(id);
        return ResponseEntity.ok(usuario);
    }
    
    @PostMapping
    public ResponseEntity<Object> createUsuario(@RequestBody Usuario usuario) {
        
        usuarioService.create(usuario);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Usuario creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateUsuario(@PathVariable Integer id, @RequestBody Usuario usuario) {
        usuario.setIdUsuario(id);
        usuarioService.modify(usuario);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Usuario actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteUsuario(@PathVariable Integer id) {
        usuarioService.remove(id);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Usuario eliminado exitosamente"));
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<Usuario>> buscarUsuarios(@RequestParam String criterio) {
        List<Usuario> usuarios = usuarioService.buscar(criterio);
        return ResponseEntity.ok(usuarios);
    }
    

}