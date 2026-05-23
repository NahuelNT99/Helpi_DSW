import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Client, CategoriaAtencion } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export interface NuevaAtencion {
  idCliente: number;
  idCategoria: number;
  descripcion: string;
  estado: string;
}

@Component({
  selector: 'app-attention-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attention-form.component.html',
  styleUrl: './attention-form.component.css'
})
export class AttentionFormComponent implements OnInit {
  @Input() selectedClient: Client | null = null;
  @Output() attentionCreated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  categorias: CategoriaAtencion[] = [];
  estados = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En proceso', label: 'En proceso' },
    { value: 'Resuelta', label: 'Resuelta' },
    { value: 'Escalada', label: 'Escalada' }
  ];

  atencionForm: NuevaAtencion = {
    idCliente: 0,
    idCategoria: 0,
    descripcion: '',
    estado: 'Pendiente'
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategorias();
    if (this.selectedClient) {
      this.atencionForm.idCliente = this.selectedClient.idCliente;
    }
  }

  loadCategorias() {
    this.apiService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.errorMessage = 'Error al cargar las categorías';
      }
    });
  }

  onSubmit() {
    const currentUserId = this.getCurrentUserId();
    if (currentUserId === 0) {
      alert('Su sesión ha expirado, por favor inicie sesión nuevamente.');
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    if (!this.selectedClient) {
      this.errorMessage = 'No hay cliente seleccionado';
      return;
    }

    if (!this.atencionForm.descripcion.trim()) {
      this.errorMessage = 'La descripción es obligatoria';
      return;
    }

    if (!this.atencionForm.idCategoria) {
      this.errorMessage = 'Debe seleccionar una categoría';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const atencionPayload = {
      descripcion: this.atencionForm.descripcion,
      estado: this.atencionForm.estado,
      cliente: { idCliente: this.selectedClient.idCliente },
      usuario: { idUsuario: currentUserId },
      categoria: { idCategoria: Number(this.atencionForm.idCategoria) }
    };

    this.apiService.createAtencion(atencionPayload).subscribe({
      next: (response) => {
        this.successMessage = 'Atención registrada exitosamente';
        this.resetForm();
        this.attentionCreated.emit();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al crear atención:', error);
        this.errorMessage = 'Error al registrar la atención';
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.atencionForm = {
      idCliente: this.selectedClient ? this.selectedClient.idCliente : 0,
      idCategoria: 0,
      descripcion: '',
      estado: 'Pendiente'
    };
  }

  getCurrentUserId(): number {
    const userInfo = this.authService.getCurrentUserInfo();
    if (userInfo && userInfo.id) {
      return userInfo.id;
    }
    console.error('No se pudo obtener el ID del usuario actual.');
    return 0;
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  onCancel() {
    this.cancel.emit();
  }
}
