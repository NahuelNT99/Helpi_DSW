package org.cibertec.proyecto.Service.ServiceImpl;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.cibertec.proyecto.Entity.Ticket;
import org.cibertec.proyecto.Service.ReporteService;
import org.cibertec.proyecto.Service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Autowired
    private TicketService ticketService;

    @Override
    public ByteArrayInputStream generarReporteTicketsExcel() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Tickets HELPI");

            // Crear encabezado
            Row headerRow = sheet.createRow(0);
            String[] columnas = {"ID Ticket", "Estado", "Prioridad", "Descripción", "Categoría"};
            for (int i = 0; i < columnas.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columnas[i]);
            }

            // Llenar datos
            List<Ticket> tickets = ticketService.getAll();
            int rowIdx = 1;
            for (Ticket ticket : tickets) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(ticket.getIdTicket());
                row.createCell(1).setCellValue(ticket.getEstadoTicket());
                row.createCell(2).setCellValue(ticket.getPrioridad() != null ? ticket.getPrioridad().name() : "N/A");
                row.createCell(3).setCellValue(ticket.getDescripcionProblema());
                row.createCell(4).setCellValue(ticket.getCategoria() != null ? ticket.getCategoria().getNombreCategoria() : "Sin Categoría");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Error al generar el archivo Excel", e);
        }
    }

    @Override
    public ByteArrayInputStream generarReporteTicketsPDF() {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título
            document.add(new Paragraph("Reporte General de Tickets - HELPI\n\n"));

            // Tabla PDF de 5 columnas
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);

            // Encabezados
            String[] columnas = {"ID", "Estado", "Prioridad", "Descripción", "Categoría"};
            for (String columna : columnas) {
                PdfPCell cell = new PdfPCell(new Phrase(columna));
                table.addCell(cell);
            }

            // Datos
            List<Ticket> tickets = ticketService.getAll();
            for (Ticket ticket : tickets) {
                table.addCell(String.valueOf(ticket.getIdTicket()));
                table.addCell(ticket.getEstadoTicket());
                table.addCell(ticket.getPrioridad() != null ? ticket.getPrioridad().name() : "N/A");
                table.addCell(ticket.getDescripcionProblema());
                table.addCell(ticket.getCategoria() != null ? ticket.getCategoria().getNombreCategoria() : "N/A");
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error al generar el archivo PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}