import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Ticket } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
// NUEVAS IMPORTACIONES PARA LOS REPORTES
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ticket-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-management.component.html',
  styleUrl: './ticket-management.component.css'
})
export class TicketManagementComponent implements OnInit {
  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  isEditing = false;
  isCreating = false;
  searchTerm = '';
  estadosTicket = ['Pendiente', 'Resuelta'];
  prioridadesTicket = ['Baja', 'Media', 'Alta'];
  clientes: any[] = [];
  tecnicos: any[] = [];
  usuarios: any[] = [];
  categorias: any[] = [];
  currentUser: any = null;
  isTecnico = false;
  isAsesor = false;
  clienteDni: string = '';
  clienteEncontrado: any = null;
  clienteSearchError: string = '';
  searchTimeout: any = null;
  newTicket: Ticket = {
    atencion: {
      idAtencion: 0,
      descripcion: '',
      estado: 'Pendiente',
      fechaHora: '',
      cliente: { idCliente: 0, nombreCompleto: '' },
      usuario: { idUsuario: 0, nombreCompleto: '' },
      categoria: { idCategoria: 0, nombreCategoria: '' }
    },
    tecnico: { idUsuario: 0, nombreCompleto: '' },
    descripcionProblema: '',
    prioridad: 'Media',
    estadoTicket: 'Pendiente'
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private http: HttpClient // <--- Inyectamos HttpClient para las descargas
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.isTecnico = this.currentUser.role === 'Tecnico';
        this.isAsesor = this.currentUser.role === 'Asesor';
        this.loadInitialData();
      }
    });
  }

  // ========================================================
  // SECCIÓN NUEVA: LÓGICA DE EXPORTACIÓN (EXCEL / PDF)
  // ========================================================

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  descargarExcel(): void {
    this.http.get(`${environment.apiUrl}/reportes/tickets/excel`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_tickets_helpi.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar Excel:', err);
        alert('No se pudo descargar el Excel. Verifica que tienes permisos (Rol Supervisor/Asesor).');
      }
    });
  }

  descargarPdf(): void {
    this.http.get(`${environment.apiUrl}/reportes/tickets/pdf`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_tickets_helpi.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar PDF:', err);
        alert('No se pudo descargar el PDF. Verifica que tienes permisos (Rol Supervisor/Asesor).');
      }
    });
  }

  // ========================================================
  // SECCIÓN ORIGINAL: LÓGICA DE NEGOCIO (NO SE TOCÓ NADA)
  // ========================================================

  loadCategorias(): void {
    this.apiService.getCategorias().subscribe({
      next: (categorias: any[]) => {
        this.categorias = categorias;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadInitialData() {
    this.loadClientes();
    this.loadTecnicos();
    this.loadUsuarios();
    this.apiService.getCategorias().subscribe({
      next: (categorias: any[]) => {
        this.categorias = categorias;
        this.loadTickets();
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.loadTickets();
      }
    });
  }

  loadUsuarios() {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadClientes() {
    this.apiService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes.map((c: any) => ({
          ...c,
          idCliente: c.idCliente ?? c.id_cliente
        }));
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  loadTecnicos() {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.tecnicos = usuarios.filter((u: any) => {
          const nombreRol = u.rol?.nombreRol || '';
          return nombreRol.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === 'tecnico';
        });
      },
      error: (error) => {
        console.error('Error loading technicians:', error);
      }
    });
  }

  loadTickets() {
    if (this.isTecnico && this.currentUser?.id) {
      this.apiService.getTicketsByTecnico(this.currentUser.id).subscribe({
        next: (tickets) => {
          this.processTickets(tickets);
        },
        error: (error) => {
          console.error('Error loading technician tickets:', error);
        }
      });
    } else {
      this.apiService.getTickets().subscribe({
        next: (tickets) => {
          this.processTickets(tickets);
        },
        error: (error) => {
          console.error('Error loading tickets:', error);
        }
      });
    }
  }

  private processTickets(tickets: Ticket[]) {
    this.tickets = tickets.map(ticket => {
      let idCat = ticket.atencion?.categoria?.idCategoria;
      if (!ticket.atencion.categoria) {
        ticket.atencion.categoria = { idCategoria: idCat, nombreCategoria: '' };
      }
      const cat = this.categorias.find(c => c.idCategoria === idCat);
      ticket.atencion.categoria.nombreCategoria = cat ? cat.nombreCategoria : 'Sin categoría';
      return ticket;
    });
  }

  searchTickets() {
    if (this.searchTerm.trim()) {
      this.apiService.buscarTickets(this.searchTerm).subscribe({
        next: (tickets) => {
          this.tickets = tickets;
        },
        error: (error) => {
          console.error('Error searching tickets:', error);
        }
      });
    } else {
      this.loadTickets();
    }
  }

  selectTicket(ticket: Ticket) {
    this.selectedTicket = JSON.parse(JSON.stringify(ticket));

    if (this.selectedTicket) {
      if (!this.selectedTicket.tecnico) {
        this.selectedTicket.tecnico = { idUsuario: 0, nombreCompleto: '' };
      }
      if (!this.selectedTicket.atencion) {
        this.selectedTicket.atencion = { 
          idAtencion: 0, 
          descripcion: '', 
          estado: 'Pendiente', 
          fechaHora: new Date().toISOString(),
          cliente: { idCliente: 0, nombreCompleto: '' }, 
          usuario: { idUsuario: 0, nombreCompleto: '' }, 
          categoria: { idCategoria: 0, nombreCategoria: '' } 
        };
      }
      if (!this.selectedTicket.atencion.cliente) {
        this.selectedTicket.atencion.cliente = { idCliente: 0, nombreCompleto: '' };
      }
      if (!this.selectedTicket.atencion.usuario) {
        this.selectedTicket.atencion.usuario = { idUsuario: 0, nombreCompleto: '' };
      }
      if (!this.selectedTicket.atencion.categoria) {
        this.selectedTicket.atencion.categoria = { idCategoria: 0, nombreCategoria: '' };
      }
    }
    
    this.loadClientes();
    if (this.selectedTicket && this.selectedTicket.tecnico) {
      this.loadTecnicosWithSync(this.selectedTicket.tecnico.idUsuario);
    }
    this.loadCategorias();
    this.isEditing = false;
    this.isCreating = false;
  }

  loadTecnicosWithSync(tecnicoId: number) {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.tecnicos = usuarios.filter((u: any) => {
          const nombreRol = u.rol?.nombreRol || '';
          return nombreRol.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') === 'tecnico';
        });
        if (this.selectedTicket && tecnicoId) {
          const found = this.tecnicos.find(t => t.idUsuario === tecnicoId);
          if (found) {
            this.selectedTicket.tecnico = found;
          }
        }
      },
      error: (error) => {
        console.error('Error loading technicians:', error);
      }
    });
  }

  editTicket() {
    if (this.isAsesor) return;
    if (this.selectedTicket && this.isTecnico && this.selectedTicket.tecnico.idUsuario !== this.currentUser.id) return;
    if (this.selectedTicket) {
      if (!this.selectedTicket.tecnico) {
        this.selectedTicket.tecnico = { idUsuario: 0, nombreCompleto: '' };
      }
      this.isEditing = true;
      this.loadClientes();
      this.loadTecnicos();
      this.loadCategorias();
    }
  }

  startCreating() {
    if (this.isTecnico) return;
    this.isCreating = true;
    this.selectedTicket = null;
    this.clienteDni = '';
    this.clienteEncontrado = null;
    this.clienteSearchError = '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.newTicket = {
      atencion: {
        idAtencion: 0,
        descripcion: '',
        estado: 'Pendiente',
        fechaHora: '',
        cliente: { idCliente: 0, nombreCompleto: '' },
        usuario: { idUsuario: 0, nombreCompleto: '' },
        categoria: { idCategoria: 0, nombreCategoria: '' }
      },
      tecnico: { idUsuario: 0, nombreCompleto: '' },
      descripcionProblema: '',
      prioridad: 'Media',
      estadoTicket: 'Pendiente'
    };
  }

  createTicket() {
    if (this.isTecnico) return;
    if (!this.clienteDni || this.clienteDni.trim() === '') { alert('Debe ingresar el DNI del cliente.'); return; }
    if (this.clienteDni.length !== 8 || !/^[0-9]{8}$/.test(this.clienteDni)) { alert('El DNI debe tener exactamente 8 dígitos numéricos.'); return; }
    if (!this.clienteEncontrado || !this.newTicket.atencion.cliente.idCliente || this.newTicket.atencion.cliente.idCliente === 0) { alert('No se ha encontrado un cliente válido con el DNI ingresado.'); return; }
    if (this.clienteSearchError) { alert('Hay un error en la búsqueda del cliente: ' + this.clienteSearchError); return; }
    if (!this.newTicket.tecnico.idUsuario || this.newTicket.tecnico.idUsuario === 0) { alert('Debe seleccionar un técnico válido.'); return; }
    if (!this.newTicket.atencion.categoria.idCategoria || this.newTicket.atencion.categoria.idCategoria === 0) { alert('Debe seleccionar una categoría de atención válida.'); return; }

    const username = this.authService.getUsername();
    const nombreCompleto = this.authService.getUserFullName();
    const usuarioEncontrado = this.usuarios.find(u => u.usuarioLogin === username);
    if (usuarioEncontrado) {
      this.newTicket.atencion.usuario.idUsuario = usuarioEncontrado.idUsuario ?? 0;
      this.newTicket.atencion.usuario.nombreCompleto = nombreCompleto;
    }

    const atencionPayload = {
      descripcion: this.newTicket.descripcionProblema,
      estado: this.newTicket.atencion.estado,
      cliente: { idCliente: this.newTicket.atencion.cliente.idCliente },
      usuario: { idUsuario: this.newTicket.atencion.usuario.idUsuario },
      categoria: { idCategoria: Number(this.newTicket.atencion.categoria.idCategoria) }
    };
    
    this.apiService.createAtencion(atencionPayload).subscribe({
      next: (atencionResponse: any) => {
        const idAtencion = atencionResponse.idAtencion || atencionResponse.id || atencionResponse?.atencion?.idAtencion;
        if (!idAtencion) { alert('Error: No se pudo obtener el id de la atención creada.'); return; }
        
        const categoriaSeleccionada = {
          idCategoria: this.newTicket.atencion.categoria.idCategoria,
          nombreCategoria: this.categorias.find(c => c.idCategoria === this.newTicket.atencion.categoria.idCategoria)?.nombreCategoria || ''
        };
        
        const ticketPayload: any = {
          ...this.newTicket,
          categoria: categoriaSeleccionada,
          atencion: {
            ...this.newTicket.atencion,
            idAtencion: idAtencion,
            descripcion: this.newTicket.descripcionProblema,
            estado: this.newTicket.atencion.estado,
            cliente: { idCliente: this.newTicket.atencion.cliente.idCliente, nombreCompleto: '' },
            usuario: { idUsuario: this.newTicket.atencion.usuario.idUsuario, nombreCompleto: '' },
            categoria: categoriaSeleccionada
          }
        };
        
        this.apiService.createTicket(ticketPayload).subscribe({
          next: (ticketResponse: any) => {
            const ticketId = ticketResponse.idTicket || ticketResponse.id || 'N/A';
            this.notificationService.addTicketNotification(ticketId.toString(), this.newTicket.descripcionProblema);
            this.loadTickets();
            this.isCreating = false;
            alert('Ticket creado exitosamente');
          },
          error: (error) => {
            console.error('Error creating ticket:', error);
            alert('Error al crear ticket');
          }
        });
      },
      error: (error) => {
        console.error('Error creating atención:', error);
        alert('Error al crear atención');
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.isCreating = false;
    this.selectedTicket = null;
    this.clienteDni = '';
    this.clienteEncontrado = null;
    this.clienteSearchError = '';
    if (this.searchTimeout) { clearTimeout(this.searchTimeout); }
    this.loadTickets();
  }

  getPriorityClass(prioridad: string): string {
    switch (prioridad) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'bg-blue-100 text-blue-800';
      case 'Resuelta': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  deleteTicket() {
    if (!this.selectedTicket || this.isTecnico || this.isAsesor) return;
    if (confirm('¿Está seguro de que desea eliminar este ticket?')) {
      this.apiService.deleteTicket(this.selectedTicket.idTicket!).subscribe({
        next: () => {
          this.loadTickets();
          this.selectedTicket = null;
          alert('Ticket eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error deleting ticket:', error);
          alert('Error al eliminar ticket');
        }
      });
    }
  }

  saveTicket() {
    if (!this.selectedTicket) return;
    const ticket = this.selectedTicket;
    
    if (!ticket.atencion?.cliente?.idCliente || ticket.atencion.cliente.idCliente === 0) { alert('Debe seleccionar un cliente válido.'); return; }
    if (!ticket.tecnico?.idUsuario || ticket.tecnico.idUsuario === 0) { alert('Debe seleccionar un técnico válido.'); return; }
    if (!ticket.atencion?.categoria?.idCategoria || ticket.atencion.categoria.idCategoria === 0) { alert('Debe seleccionar una categoría válida.'); return; }

    const cliente = this.clientes.find(c => c.idCliente === ticket.atencion!.cliente!.idCliente)!;
    const tecnico = this.usuarios.find(u => u.idUsuario === ticket.tecnico!.idUsuario)!;
    const categoria = this.categorias.find(c => c.idCategoria === ticket.atencion!.categoria!.idCategoria)!;
    const usuario = this.usuarios.find(u => u.idUsuario === ticket.atencion!.usuario!.idUsuario)!;
    
    const ticketPayload: any = {
      descripcionProblema: ticket.descripcionProblema,
      prioridad: ticket.prioridad,
      estadoTicket: ticket.estadoTicket,
      categoria: { idCategoria: categoria.idCategoria, nombreCategoria: categoria.nombreCategoria },
      tecnico: { idUsuario: tecnico.idUsuario, nombreCompleto: tecnico.nombreCompleto },
      atencion: {
        idAtencion: ticket.atencion!.idAtencion || 0,
        descripcion: ticket.descripcionProblema,
        estado: ticket.estadoTicket,
        fechaHora: ticket.atencion!.fechaHora || new Date().toISOString(),
        cliente: { idCliente: cliente.idCliente, nombreCompleto: cliente.nombreCompleto },
        usuario: { idUsuario: usuario.idUsuario, nombreCompleto: usuario.nombreCompleto },
        categoria: { idCategoria: categoria.idCategoria, nombreCategoria: categoria.nombreCategoria }
      }
    };
    
    this.apiService.updateTicket(this.selectedTicket.idTicket!, ticketPayload).subscribe({
      next: () => {
        this.loadTickets();
        this.isEditing = false;
        alert('Ticket actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error updating ticket:', error);
        alert('Error al actualizar ticket: ' + (error.error?.error || error.message));
      }
    });
  }

  onDniInput(event: any): void {
    const dni = event.target.value.trim();
    this.clienteDni = dni;
    this.clienteSearchError = '';
    this.clienteEncontrado = null;
    this.newTicket.atencion.cliente = { idCliente: 0, nombreCompleto: '' };
    
    if (this.searchTimeout) { clearTimeout(this.searchTimeout); }
    
    if (dni.length === 8 && /^[0-9]{8}$/.test(dni)) {
      this.searchTimeout = setTimeout(() => { this.buscarClientePorDni(dni); }, 500);
    } else if (dni.length > 0 && dni.length < 8) {
      this.clienteSearchError = 'El DNI debe tener 8 dígitos';
    }
  }
  
  private buscarClientePorDni(dni: string): void {
    this.apiService.getClientByDni(dni).subscribe({
      next: (cliente) => {
        this.clienteEncontrado = cliente;
        this.clienteSearchError = '';
        this.newTicket.atencion.cliente = { idCliente: cliente.idCliente, nombreCompleto: cliente.nombreCompleto };
      },
      error: (error) => {
        this.clienteEncontrado = null;
        this.clienteSearchError = 'Cliente no encontrado con el DNI: ' + dni;
        this.newTicket.atencion.cliente = { idCliente: 0, nombreCompleto: '' };
      }
    });
  }
}