package org.cibertec.proyecto.Service.ServiceImpl;

import org.cibertec.proyecto.Entity.Cliente;
import org.cibertec.proyecto.Repository.ClienteRepository;
import org.cibertec.proyecto.Service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteServiceImpl extends GenericServiceImpl<Cliente, Integer> implements ClienteService {

    @Override
    public void modify(Cliente cliente) {
        if (cliente.getIdCliente() != null) {
            Cliente original = clienteRepository.findById(cliente.getIdCliente()).orElse(null);
            if (original != null) {
                cliente.setNumeroCliente(original.getNumeroCliente());
            }
        }
        super.modify(cliente);
    }

    @Override
    public void create(Cliente cliente) {
        if (cliente.getNumeroCliente() == null || cliente.getNumeroCliente().isEmpty()) {
            Cliente ultimo = clienteRepository.findTopByOrderByIdClienteDesc();
            int nextNumber = (ultimo != null && ultimo.getNumeroCliente() != null)
                    ? Integer.parseInt(ultimo.getNumeroCliente().replaceAll("\\D", "")) + 1
                    : 1;

            String numeroCliente = String.format("H%04d", nextNumber);
            cliente.setNumeroCliente(numeroCliente);
        }
        super.create(cliente);
    }
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    public void setRepository(ClienteRepository clienteRepository) {
        this.repository = clienteRepository;
        this.clienteRepository = clienteRepository;
    }
    
    @Override
    public List<Cliente> buscar(String criterio) {
        return clienteRepository.findAll();
    }

    @Override
    public Cliente findByDni(String dni) {
        return clienteRepository.findByDni(dni);
    }
}
