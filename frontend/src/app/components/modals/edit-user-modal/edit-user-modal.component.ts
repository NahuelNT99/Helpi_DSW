import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rol, ModalUser } from '../../../types';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.css']
})
export class EditUserModalComponent implements OnChanges {
  @Input() isVisible: boolean = false;
  @Input() user: ModalUser | null = null;
  @Input() roles: Rol[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<ModalUser>();

  editUser: ModalUser = {
    nombreCompleto: '',
    username: '',
    email: '',
    telefono: '',
    rol: ''
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.editUser = { ...this.user };
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.userUpdated.emit({ ...this.editUser });
      this.close.emit();
    }
  }

  private isFormValid(): boolean {
    return !!(this.editUser.nombreCompleto && 
             this.editUser.username && 
             this.editUser.email && 
             this.editUser.telefono && 
             this.editUser.rol);
  }
}