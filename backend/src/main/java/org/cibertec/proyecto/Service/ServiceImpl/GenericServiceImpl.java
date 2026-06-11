package org.cibertec.proyecto.Service.ServiceImpl;

import org.cibertec.proyecto.Service.GenericService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional; // <-- IMPORTANTE IMPORTAR ESTO

import java.util.List;

public class GenericServiceImpl <T,ID> implements GenericService<T,ID> {

    protected JpaRepository<T,ID> repository;

    @Override
    @Transactional(readOnly = true) // <-- Solo lectura, optimiza el rendimiento
    public T getById(ID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<T> getAll() {
        return repository.findAll();
    }

    @Override
    @Transactional // <-- Garantiza ACID: Si hay error, hace rollback automático
    public void create(T entity) {
        repository.save(entity);
    }

    @Override
    @Transactional
    public void modify(T entity) {
        repository.save(entity);
    }

    @Override
    @Transactional
    public void remove(ID id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<T> buscar(String criterio) {
        return repository.findAll();
    }
}