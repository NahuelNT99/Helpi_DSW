package org.cibertec.proyecto.Service.ServiceImpl;

import org.cibertec.proyecto.Entity.Usuario;
import org.cibertec.proyecto.Repository.UsuarioRepository;
import org.cibertec.proyecto.Service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioServiceImpl extends GenericServiceImpl<Usuario, Integer> implements UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    public void setRepository(UsuarioRepository usuarioRepository) {
        this.repository = usuarioRepository;
        this.usuarioRepository = usuarioRepository;
    }
    
    @Override
    public void create(Usuario usuario) {
        if (usuario.getClaveHash() != null && !usuario.getClaveHash().isEmpty()) {
            String originalPassword = usuario.getClaveHash();
            String encodedPassword = passwordEncoder.encode(originalPassword);
            usuario.setClaveHash(encodedPassword);
        }
        
        super.create(usuario);
    }
    
    @Override
    public void modify(Usuario usuario) {
        if (usuario.getClaveHash() != null && !usuario.getClaveHash().isEmpty()) {
            if (!usuario.getClaveHash().startsWith("$2")) {
                usuario.setClaveHash(passwordEncoder.encode(usuario.getClaveHash()));
            }
        }
        super.modify(usuario);
    }
    
    @Override
    public List<Usuario> buscar(String criterio) {
        return usuarioRepository.findAll();
    }
}