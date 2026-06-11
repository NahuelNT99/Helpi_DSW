
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';


export interface CategoriaAtencion {
  idCategoria: number;
  nombreCategoria: string;
}

export interface Client {
  idCliente: number;
  dni: string;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  estadoServicio: string;
  tipoPlan: string;
  costoPlan: number;
  numeroCliente: string;
}

export interface CallHistoryTicket {
  idAtencion: number;
  descripcion: string;
  estado: string;
  fechaHora: string;
  cliente?: {
    dni: string;
    nombreCompleto: string;
  };
  usuario?: {
    nombreCompleto: string;
  };
  categoria?: {
    idCategoria: number;
    nombreCategoria: string;
  };
}

export interface Usuario {
  idUsuario?: number;
  usuarioLogin: string;  
  claveHash?: string;    
  email: string;
  nombreCompleto: string; 
  nombre?: string;      
  apellido?: string;   
  telefono: string;
  rol: {
    idRol: number;
    nombreRol: string;
  };
}

export interface Ticket {
  idTicket?: number;
  atencion: {
    idAtencion: number;
    descripcion: string;
    estado: string;
    fechaHora: string;
    cliente: {
      idCliente: number;
      nombreCompleto: string;
    };
    usuario: {
      idUsuario: number;
      nombreCompleto: string;
    };
    categoria: {
      idCategoria: number;
      nombreCategoria: string;
    };
  };
  tecnico: {
    idUsuario: number;
    nombreCompleto: string;
  };
  descripcionProblema: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estadoTicket: string;
  fechaCreacion?: string;
  fechaResolucion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  createCliente(cliente: Client): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/clientes`, cliente, {
      headers: this.getAuthHeaders()
    });
  }

  updateCliente(id: number, cliente: Client): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/clientes/${id}`, cliente, { headers: this.getAuthHeaders() });
  }

  deleteCliente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/clientes/${id}`, { headers: this.getAuthHeaders() });
  }
  createAtencion(atencion: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/atenciones`, atencion, {
      headers: this.getAuthHeaders()
    });
  }
  getClientes(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clientes`, { headers: this.getAuthHeaders() });
  }
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getClientByDni(dni: string): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/clientes/dni/${dni}`, { headers: this.getAuthHeaders() });
  }


  getCallHistoryByDni(dni: string): Observable<CallHistoryTicket[]> {
    return this.http.get<CallHistoryTicket[]>(`${this.baseUrl}/atenciones/historial-llamadas/${dni}`, { headers: this.getAuthHeaders() });
  }


  getAllAtenciones(): Observable<CallHistoryTicket[]> {
    return this.http.get<CallHistoryTicket[]>(`${this.baseUrl}/atenciones`, { headers: this.getAuthHeaders() });
  }


  getAtencionesByUsuario(idUsuario: number): Observable<CallHistoryTicket[]> {
    return this.http.get<CallHistoryTicket[]>(`${this.baseUrl}/atenciones/usuario/${idUsuario}`, { headers: this.getAuthHeaders() });
  }


  updateAtencion(idAtencion: number, atencion: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/atenciones/${idAtencion}`, atencion, { headers: this.getAuthHeaders() });
  }


  deleteAtencion(idAtencion: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/atenciones/${idAtencion}`, { headers: this.getAuthHeaders() });
  }

  searchTickets(query: string): Observable<CallHistoryTicket[]> {
    return this.http.get<CallHistoryTicket[]>(`${this.baseUrl}/tickets/buscar?q=${query}`);
  }

  getCategorias(): Observable<CategoriaAtencion[]> {
    return this.http.get<CategoriaAtencion[]>(`${this.baseUrl}/categorias-atencion`, { headers: this.getAuthHeaders() });
  }

  getEstadosAtencion(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/atenciones/estados`, { headers: this.getAuthHeaders() });
  }
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`, { headers: this.getAuthHeaders() });
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/${id}`, { headers: this.getAuthHeaders() });
  }

  createUsuario(usuario: Usuario): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/usuarios`, usuario, { 
      headers: this.getAuthHeaders()
    });
  }

  updateUsuario(id: number, usuario: Usuario): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/usuarios/${id}`, usuario, { headers: this.getAuthHeaders() });
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/usuarios/${id}`, { headers: this.getAuthHeaders() });
  }

  buscarUsuarios(criterio: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios/buscar?criterio=${criterio}`, { headers: this.getAuthHeaders() });
  }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets`, { headers: this.getAuthHeaders() });
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/tickets/${id}`, { headers: this.getAuthHeaders() });
  }

  createTicket(ticket: Ticket): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tickets`, ticket, {
      headers: this.getAuthHeaders()
    });
  }

  updateTicket(id: number, ticket: Ticket): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/tickets/${id}`, ticket, { headers: this.getAuthHeaders() });
  }

  deleteTicket(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/tickets/${id}`, { headers: this.getAuthHeaders() });
  }

  buscarTickets(criterio: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets/buscar?criterio=${criterio}`, { headers: this.getAuthHeaders() });
  }

  getTicketsByTecnico(idTecnico: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets/tecnico/${idTecnico}`, { headers: this.getAuthHeaders() });
  }
}