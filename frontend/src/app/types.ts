export interface Rol {
  id: number;
  nombre: string;
}

export interface ModalUser {
  id?: number;
  nombreCompleto: string;
  username: string;
  password?: string;
  email: string;
  telefono: string;
  rol: string;
}
