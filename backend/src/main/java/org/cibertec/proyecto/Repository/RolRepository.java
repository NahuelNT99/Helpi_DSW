package org.cibertec.proyecto.Repository;

import org.cibertec.proyecto.Entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Integer> {
}