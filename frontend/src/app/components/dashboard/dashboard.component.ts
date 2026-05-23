import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ClientsComponent } from '../clients/clients.component';
import { CallHistoryComponent } from '../call-history/call-history.component';
import { UserManagementComponent } from '../user-management/user-management.component';
import { TicketManagementComponent } from '../ticket-management/ticket-management.component';
import { CallHistoryTicket, ApiService, Client, Usuario, Ticket } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ClientsComponent,
    CallHistoryComponent,
    UserManagementComponent,
    TicketManagementComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  selectedClientHistory: CallHistoryTicket[] = [];
  activeTab: string;
  
  totalClientes: number = 0;
  ticketsActivos: number = 0;
  totalUsuarios: number = 0;
  llamadasHoy: number = 0;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {
    const role = this.authService.getUserRole();
    if (role === 'Técnico' || role === 'Tecnico') {
      this.activeTab = 'tickets';
    } else if (role === 'Supervisor') {
      this.activeTab = 'overview';
    } else {
      this.activeTab = 'clients';
    }
  }

  get userRole(): string {
    return this.authService.getUserRole() || '';
  }

  get isSupervisor(): boolean {
    return this.userRole === 'Supervisor';
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onClientSelected(callHistory: CallHistoryTicket[]) {
    this.selectedClientHistory = callHistory;
  }

  ngOnInit() {
    this.loadDashboardMetrics();
    
    setTimeout(() => {
       this.notificationService.addSystemNotification(
         'Mantenimiento programado',
         'Sistema en mantenimiento mañana 2-4 AM'
       );
     }, 2000);
  }

  private loadDashboardMetrics() {
    this.loadClientesCount();
    this.loadTicketsActivos();
    this.loadUsuariosCount();
    this.loadLlamadasHoy();
  }

  private loadClientesCount() {
    this.apiService.getClientes().subscribe({
      next: (clientes: Client[]) => {
        this.totalClientes = clientes.length;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.totalClientes = 0;
      }
    });
  }

  private loadTicketsActivos() {
    this.apiService.getTickets().subscribe({
      next: (tickets: Ticket[]) => {
        this.ticketsActivos = tickets.filter(ticket => 
          ticket.estadoTicket === 'Pendiente' || 
          ticket.estadoTicket === 'En Proceso' ||
          ticket.estadoTicket === 'Activo'
        ).length;
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
        this.ticketsActivos = 0;
      }
    });
  }

  private loadUsuariosCount() {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.totalUsuarios = usuarios.length;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.totalUsuarios = 0;
      }
    });
  }

  private loadLlamadasHoy() {
    this.apiService.getAllAtenciones().subscribe({
      next: (atenciones: CallHistoryTicket[]) => {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
        
        this.llamadasHoy = atenciones.filter(atencion => {
          const fechaAtencion = new Date(atencion.fechaHora).toISOString().split('T')[0];
          return fechaAtencion === hoyStr;
        }).length;
      },
      error: (error) => {
        console.error('Error al cargar atenciones:', error);
        this.llamadasHoy = 0;
      }
    });
  }
}