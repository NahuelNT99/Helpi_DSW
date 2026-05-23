import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, CallHistoryTicket, CategoriaAtencion } from '../../../services/api.service';

@Component({
  selector: 'app-edit-atencion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-atencion-modal.component.html',
  styleUrl: './edit-atencion-modal.component.css'
})
export class EditAtencionModalComponent implements OnInit, OnChanges {
  @Input() atencion: CallHistoryTicket | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CallHistoryTicket>();

  editForm = {
    descripcion: '',
    estado: '',
    idCategoria: 0
  };

  categorias: CategoriaAtencion[] = [];
  estados = ['Pendiente', 'En Proceso', 'Resuelto', 'Escalado'];
  isLoading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCategorias();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('=== DEBUG MODAL ngOnChanges ===');
    console.log('changes:', changes);
    console.log('this.atencion:', this.atencion);
    console.log('this.isVisible:', this.isVisible);
    
    if ((changes['atencion'] || changes['isVisible']) && this.atencion && this.isVisible) {
      console.log('Actualizando editForm con datos de atención');
      this.editForm = {
        descripcion: this.atencion.descripcion,
        estado: this.atencion.estado,
        idCategoria: this.atencion.categoria?.idCategoria || 0
      };
      console.log('editForm actualizado:', this.editForm);
    }
    console.log('=== FIN DEBUG MODAL ===');
  }

  loadCategorias() {
    this.apiService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  onSave() {
    if (!this.atencion || !this.editForm.descripcion.trim()) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    this.isLoading = true;
    
    const updateData = {
      descripcion: this.editForm.descripcion,
      estado: this.editForm.estado,
      categoria: {
        idCategoria: this.editForm.idCategoria
      }
    };

    this.apiService.updateAtencion(this.atencion.idAtencion, updateData).subscribe({
      next: (response) => {
        const updatedAtencion = {
          ...this.atencion!,
          descripcion: this.editForm.descripcion,
          estado: this.editForm.estado,
          categoria: this.categorias.find(c => c.idCategoria == this.editForm.idCategoria)
        };
        
        this.save.emit(updatedAtencion as CallHistoryTicket);
        this.isLoading = false;
        this.onClose();
      },
      error: (error) => {
        console.error('Error al actualizar atención:', error);
        alert('Error al actualizar la atención. Por favor, inténtalo de nuevo.');
        this.isLoading = false;
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}