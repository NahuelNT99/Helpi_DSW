package org.cibertec.proyecto.Service.ServiceImpl;


import org.cibertec.proyecto.Service.GenericService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public class GenericServiceImpl <T,ID> implements GenericService<T,ID> {


    protected JpaRepository<T,ID> repository;

    @Override
    public T getById(ID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    @Override
    public List<T> getAll() {
        return  repository.findAll();
    }

    @Override
    public void create(T entity) {
        repository.save(entity);
    }

    @Override
    public void modify(T entity) {
        repository.save(entity);
    }

    @Override
    public void remove(ID id) {
        repository.deleteById(id);
    }

    @Override
    public List<T> buscar(String criterio) {
        return repository.findAll();
    }
}