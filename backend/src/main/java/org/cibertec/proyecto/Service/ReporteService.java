package org.cibertec.proyecto.Service;

import java.io.ByteArrayInputStream;

public interface ReporteService {
    ByteArrayInputStream generarReporteTicketsExcel();
    ByteArrayInputStream generarReporteTicketsPDF();
}