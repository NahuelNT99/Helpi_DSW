import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Usuario } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CreateUserModalComponent } from '../modals/create-user-modal/create-user-modal.component';
import { EditUserModalComponent } from '../modals/edit-user-modal/edit-user-modal.component';
import { DeleteUserModalComponent } from '../modals/delete-user-modal/delete-user-modal.component';
import { Rol } from '../../types';
import { environment } from '../../../environments/environment'; // Ajusta la ruta según tu carpeta


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateUserModalComponent, EditUserModalComponent, DeleteUserModalComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles = [
    { id: 1, nombre: 'Asesor' },
    { id: 2, nombre: 'Técnico' },
    { id: 3, nombre: 'Supervisor' }
  ];
  
  selectedUser: any = null; 
  searchTerm = '';
  
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  
  modalRoles: { id: number; nombre: string; }[] = [
    { id: 1, nombre: 'Asesor' },
    { id: 2, nombre: 'Técnico' },
    { id: 3, nombre: 'Supervisor' }
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.loadUsers();
  }

  onSearchChange() {
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  openEditModal(user: Usuario) {
    this.selectedUser = {
      id: user.idUsuario,
      nombreCompleto: user.nombreCompleto,
      username: user.usuarioLogin,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol.nombreRol, 
      claveHash: user.claveHash 
    };
    this.showEditModal = true;
  }

  openDeleteModal(user: Usuario) {
    this.selectedUser = {
      id: user.idUsuario,
      nombreCompleto: user.nombreCompleto,
      username: user.usuarioLogin,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol.nombreRol
    };
    
    this.showDeleteModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  searchUsers() {
    if (this.searchTerm.trim()) {
      this.apiService.buscarUsuarios(this.searchTerm).subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
        },
        error: (error) => {
          console.error('Error searching users:', error);
        }
      });
    } else {
      this.loadUsers();
    }
  }

  selectUser(usuario: Usuario) {
    this.selectedUser = usuario;
  }


  onUserCreated(modalUser: any) {
    const newUser = {
      usuarioLogin: modalUser.username,
      claveHash: modalUser.password,
      email: modalUser.email,
      nombreCompleto: modalUser.nombreCompleto,
      telefono: modalUser.telefono,
      rol: {
        idRol: this.getRoleIdByName(modalUser.rol),
        nombreRol: modalUser.rol
      }
    };

    this.apiService.createUsuario(newUser).subscribe({
      next: (response) => {
        this.loadUsers();
        this.closeCreateModal();
      },
      error: (error) => {
        console.error('Error creating user:', error);
      }
    });
  }

  onUserUpdated(modalUser: any) {
    const updatedUser = {
      idUsuario: modalUser.id,
      usuarioLogin: modalUser.username,
      email: modalUser.email,
      nombreCompleto: modalUser.nombreCompleto,
      telefono: modalUser.telefono,
      claveHash: modalUser.password && modalUser.password.trim() !== '' ? modalUser.password : modalUser.claveHash,
      rol: {
        idRol: this.getRoleIdByName(modalUser.rol),
        nombreRol: modalUser.rol
      }
    };
    this.apiService.updateUsuario(updatedUser.idUsuario!, updatedUser).subscribe({
      next: (response) => {
        this.loadUsers();
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.loadUsers();
        this.closeEditModal();
      }
    });
  }

  onUserDeleted(user: any) {
    if (user && user.id) {
      this.apiService.deleteUsuario(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.loadUsers();
          this.closeDeleteModal();
        }
      });
    }
  }

  getRoleName(idRol: number): string {
    const rol = this.roles.find(r => r.id === idRol);
    return rol ? rol.nombre : 'Desconocido';
  }

  onRoleChange(event: any, user: Usuario) {
    const selectedRolId = parseInt(event.target.value);
    const selectedRol = this.roles.find(r => r.id === selectedRolId);
    if (selectedRol) {
      user.rol.idRol = selectedRol.id;
      user.rol.nombreRol = selectedRol.nombre;
    }
  }

  getRoleClass(roleName: string): string {
    switch (roleName) {
      case 'Supervisor':
        return 'role-supervisor';
      case 'Asesor':
        return 'role-asesor';
      case 'Técnico':
        return 'role-tecnico';
      default:
        return 'role-default';
    }
  }

  getRoleIdByName(roleName: string): number {
    const role = this.modalRoles.find(r => r.nombre === roleName);
    const result = role ? role.id : 2;
    return result;
  }
}