import { Component, Output, EventEmitter } from '@angular/core';
import { ApiService, Client, CallHistoryTicket } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttentionFormComponent } from '../attention-form/attention-form.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, AttentionFormComponent],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent {
  @Output() clientSelected = new EventEmitter<CallHistoryTicket[]>();
  
  searchDni: string = '';
  selectedClient: Client | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  isCreating: boolean = false;
  isEditing: boolean = false;
  isCreatingAttention: boolean = false;
  clientForm: Client = this.getEmptyClient();

  getEmptyClient(): Client {
    return {
      idCliente: 0,
      dni: '',
      nombreCompleto: '',
      telefono: '',
      correo: '',
      estadoServicio: 'Activo',
      tipoPlan: '',
      costoPlan: 0,
      numeroCliente: ''
    };
  }
  
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}
  startCreate() {
    this.isCreating = true;
    this.isEditing = false;
    this.selectedClient = null; 
    this.errorMessage = '';
    this.clientForm = this.getEmptyClient();
  }

  startEdit() {
    if (this.selectedClient) {
      this.isEditing = true;
      this.isCreating = false;
      this.errorMessage = '';
      this.clientForm = { ...this.selectedClient };
    }
  }

  cancelForm() {
    this.isCreating = false;
    this.isEditing = false;
    this.errorMessage = '';
    this.clientForm = this.getEmptyClient();
    if (this.searchDni) {
      this.searchClient();
    }
  }

  saveClient() {
    const onSaveSuccess = (response: any, action: 'create' | 'update') => {
      this.errorMessage = '';
      alert(response?.message || `Cliente ${action === 'create' ? 'creado' : 'actualizado'} exitosamente`);
      
      if (action === 'update') {
         this.notificationService.addClientNotification(
           this.clientForm.nombreCompleto,
           'actualizó su información'
         );
       } else if (action === 'create') {
         this.notificationService.addClientNotification(
           this.clientForm.nombreCompleto,
           'fue agregado al sistema'
         );
       }
      
      this.isCreating = false;
      this.isEditing = false;
      
      this.searchDni = this.clientForm.dni;
      this.searchClient();
    };

    const onSaveError = (error: any, action: 'create' | 'update') => {
      this.errorMessage = error?.error?.message || `Error al ${action === 'create' ? 'crear' : 'actualizar'} cliente`;
      console.error(error);
    };

    if (this.isCreating) {
      const payload: any = { ...this.clientForm };
      delete payload.idCliente;
      delete payload.numeroCliente;
      this.apiService.createCliente(payload).subscribe({
        next: (response) => onSaveSuccess(response, 'create'),
        error: (error) => onSaveError(error, 'create')
      });
    } else if (this.isEditing && this.selectedClient) {
      this.apiService.updateCliente(this.selectedClient.idCliente!, this.clientForm).subscribe({
        next: (response) => onSaveSuccess(response, 'update'),
        error: (error) => onSaveError(error, 'update')
      });
    }
  }

  deleteClient() {
    if (this.selectedClient && confirm('¿Está seguro de eliminar este cliente?')) {
      this.apiService.deleteCliente(this.selectedClient.idCliente!).subscribe({
        next: (response) => {
          alert(response?.message || 'Cliente eliminado exitosamente');
          this.clearSearch();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Error al eliminar cliente';
          console.error(error);
        }
      });
    }
  }

  searchClient(): void {
    if (!this.searchDni.trim()) {
      this.clearSearch();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.selectedClient = null;
    this.isCreating = false;
    this.isEditing = false;
    this.isCreatingAttention = false;

    this.apiService.getClientByDni(this.searchDni).subscribe({
      next: (client) => {
        this.selectedClient = client;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('=== ERROR DETAILS ===');
        console.error('Full error object:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        this.selectedClient = null;
        this.isLoading = false;
        this.errorMessage = 'Cliente no encontrado o error en el servidor';
        this.clientSelected.emit([]);
      }
    });
  }

  private loadCallHistory(dni: string) {
    this.apiService.getCallHistoryByDni(dni).subscribe({
      next: (callHistory) => {
        this.clientSelected.emit(callHistory);
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.clientSelected.emit([]);
      }
    });
  }

  clearSearch() {
    this.searchDni = '';
    this.selectedClient = null;
    this.errorMessage = '';
    this.isCreating = false;
    this.isEditing = false;
    this.isCreatingAttention = false;
    this.clientSelected.emit([]);
  }

  onAttentionCreated(event: any) {
    console.log('Nueva atención creada:', event);
    this.isCreatingAttention = false;
  }

  cancelAttentionForm() {
    this.isCreatingAttention = false;
  }

  startCreateAttention() {
    this.isCreatingAttention = true;
    this.isCreating = false;
    this.isEditing = false;
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case 'Activo':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Suspendido':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Inactivo':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }
}
