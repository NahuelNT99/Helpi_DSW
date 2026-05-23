import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rol, ModalUser } from '../../../types';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.css']
})
export class CreateUserModalComponent {
  @Input() isVisible: boolean = false;
  @Input() roles: Rol[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<ModalUser>();

  newUser: ModalUser = {
    nombreCompleto: '',
    username: '',
    password: '',
    email: '',
    telefono: '',
    rol: ''
  };

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.userCreated.emit({ ...this.newUser });
      this.resetForm();
      this.close.emit();
    }
  }

  private isFormValid(): boolean {
    return !!(this.newUser.nombreCompleto && 
             this.newUser.username && 
             this.newUser.password && 
             this.newUser.email && 
             this.newUser.telefono && 
             this.newUser.rol);
  }

  private resetForm() {
    this.newUser = {
      nombreCompleto: '',
      username: '',
      password: '',
      email: '',
      telefono: '',
      rol: ''
    };
  }
}