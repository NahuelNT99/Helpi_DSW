import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService, CallHistoryTicket } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { EditAtencionModalComponent } from '../modals/edit-atencion-modal/edit-atencion-modal.component';

@Component({
  selector: 'app-call-history',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, EditAtencionModalComponent],
  templateUrl: './call-history.component.html',
  styleUrl: './call-history.component.css'
})
export class CallHistoryComponent implements OnInit {
  allAtenciones: CallHistoryTicket[] = [];
  
  searchQuery: string = '';
  filteredTickets: CallHistoryTicket[] = [];
  isSearching: boolean = false;
  isLoading: boolean = false;
  
  showEditModal: boolean = false;
  selectedAtencion: CallHistoryTicket | null = null;
  
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAllAtenciones();
  }

  private isAsesor(): boolean {
    const userRole = this.authService.getUserRole();
    return userRole === 'Asesor';
  }

  private getCurrentUserId(): number {
    try {
      const token = this.authService.getToken();
      if (!token) {
        console.error('No hay token disponible');
        return 0;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.idUsuario;
      
      if (!userId) {
        console.error('No se encontró idUsuario en el token');
        return 0;
      }
      
      return parseInt(userId, 10);
    } catch (error) {
      console.error('Error al obtener el ID del usuario:', error);
      return 0;
    }
  }

  loadAllAtenciones() {
    this.isLoading = true;
    
    if (this.isAsesor()) {
      const currentUserId = this.getCurrentUserId();
      if (currentUserId === 0) {
        console.error('No se pudo obtener el ID del usuario actual');
        this.isLoading = false;
        return;
      }
      
      this.apiService.getAtencionesByUsuario(currentUserId).subscribe({
        next: (atenciones) => {
          this.allAtenciones = atenciones;
          this.filteredTickets = atenciones;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar atenciones del asesor:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.apiService.getAllAtenciones().subscribe({
        next: (atenciones) => {
          this.allAtenciones = atenciones;
          this.filteredTickets = atenciones;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar atenciones:', error);
          this.isLoading = false;
        }
      });
    }
  }

  searchTickets() {
    if (!this.searchQuery.trim()) {
      this.filteredTickets = this.allAtenciones;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredTickets = this.allAtenciones.filter(ticket => 
      ticket.idAtencion.toString().includes(query) ||
      ticket.descripcion.toLowerCase().includes(query) ||
      (ticket.categoria?.nombreCategoria || '').toLowerCase().includes(query) ||
      (ticket.cliente?.dni || '').toLowerCase().includes(query) ||
      (ticket.cliente?.nombreCompleto || '').toLowerCase().includes(query) ||
      (ticket.usuario?.nombreCompleto || '').toLowerCase().includes(query)
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredTickets = this.allAtenciones;
  }

 getStatusClass(status: string): string {
    const s = status ? status.toLowerCase() : '';
    
    if (s === 'abierto' || s === 'pendiente' || s === 'escalada') return 'bg-yellow-100 text-yellow-800'; // Pendiente = Amarillo
    if (s === 'en-progreso' || s === 'en proceso') return 'bg-blue-100 text-blue-800'; // Proceso = Azul
    if (s === 'resuelto' || s === 'resuelta') return 'bg-green-100 text-green-800'; // Resuelto = Verde
    if (s === 'cerrado') return 'bg-gray-100 text-gray-800'; // Cerrado = Gris
    
    return 'bg-gray-100 text-gray-800'; // Default
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'abierto': return 'error';
      case 'en-progreso': return 'schedule';
      case 'resuelto': return 'check_circle';
      case 'cerrado': return 'cancel';
      default: return 'help';
    }
  }

  isSupervisor(): boolean {
    return this.authService.getUserRole() === 'Supervisor';
  }

  canEditOrDelete(): boolean {
    return this.isSupervisor();
  }

  editAtencion(atencion: CallHistoryTicket) {
    console.log('=== DEBUG EDIT ATENCION ===');
    console.log('1. Método editAtencion llamado con:', atencion);
    console.log('2. Token existe:', !!this.authService.getToken());
    console.log('3. getUserRole():', this.authService.getUserRole());
    console.log('4. isSupervisor():', this.isSupervisor());
    console.log('5. canEditOrDelete():', this.canEditOrDelete());
    
    if (!this.authService.getToken()) {
      console.log('6. Usuario no autenticado');
      alert('Debes iniciar sesión para editar atenciones');
      return;
    }
    
    if (!this.canEditOrDelete()) {
      console.log('6. Sin permisos - mostrando alerta');
      alert('No tienes permisos para editar atenciones. Rol requerido: Supervisor');
      return;
    }
    
    console.log('6. Estableciendo selectedAtencion y showEditModal');
    this.selectedAtencion = atencion;
    this.showEditModal = true;
    console.log('7. selectedAtencion:', this.selectedAtencion);
    console.log('8. showEditModal:', this.showEditModal);
    console.log('=== FIN DEBUG ===');
  }

  onEditModalClose() {
    this.showEditModal = false;
    this.selectedAtencion = null;
  }

  onEditModalSave(updatedAtencion: CallHistoryTicket) {
    const index = this.allAtenciones.findIndex(a => a.idAtencion === updatedAtencion.idAtencion);
    if (index !== -1) {
      this.allAtenciones[index] = updatedAtencion;
    }
    
    const filteredIndex = this.filteredTickets.findIndex(a => a.idAtencion === updatedAtencion.idAtencion);
    if (filteredIndex !== -1) {
      this.filteredTickets[filteredIndex] = updatedAtencion;
    }
    
    this.showEditModal = false;
    this.selectedAtencion = null;
  }

  deleteAtencion(atencion: CallHistoryTicket) {
    if (!this.canEditOrDelete()) {
      alert('No tienes permisos para eliminar atenciones');
      return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar la atención #${atencion.idAtencion}?`)) {
      this.apiService.deleteAtencion(atencion.idAtencion).subscribe({
        next: () => {
          this.allAtenciones = this.allAtenciones.filter(a => a.idAtencion !== atencion.idAtencion);
          this.filteredTickets = this.filteredTickets.filter(a => a.idAtencion !== atencion.idAtencion);
          alert('Atención eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar atención:', error);
          alert('Error al eliminar la atención. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }
}
