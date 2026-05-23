package org.cibertec.proyecto.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;
    
    @Column(name = "nombre_completo", nullable = false, length = 100)
    private String nombreCompleto;
    
    @Column(name = "usuario_login", nullable = false, unique = true, length = 50)
    private String usuarioLogin;
    
    @Column(name = "clave_hash", nullable = false, length = 255)
    private String claveHash;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "telefono", length = 20)
    private String telefono;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol")
    private Rol rol;
    
    @Column(name = "estado")
    private Boolean estado = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = rol.getNombreRol().toUpperCase();
        roleName = roleName.replace("É", "E").replace("Á", "A").replace("Í", "I").replace("Ó", "O").replace("Ú", "U");
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + roleName);
        return Collections.singletonList(authority);
    }

    @Override
    public String getPassword() {
        return this.claveHash;
    }

    @Override
    public String getUsername() {
        return this.usuarioLogin;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.estado;
    }
}