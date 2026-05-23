import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalUser } from '../../../types';

@Component({
  selector: 'app-delete-user-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-user-modal.component.html',
  styleUrls: ['./delete-user-modal.component.css']
})
export class DeleteUserModalComponent {
  @Input() isVisible: boolean = false;
  @Input() user: ModalUser | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() userDeleted = new EventEmitter<ModalUser>();

  onClose() {
    this.close.emit();
  }

  onConfirmDelete() {
    if (this.user) {
      this.userDeleted.emit(this.user);
      this.close.emit();
    }
  }
}