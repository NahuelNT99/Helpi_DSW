import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  token: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface UserInfo {
  id: number;
  username: string;
  role: string;
  nombre?: string;
  apellido?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth'; 
  private tokenKey = 'jwt_token';
  private userInfoKey = 'user_info';

  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this._isAuthenticated.asObservable();

  private _currentUser = new BehaviorSubject<UserInfo | null>(this.getCurrentUserInfo());
  currentUser$ = this._currentUser.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.refreshCurrentUser();
  }

  private refreshCurrentUser(): void {
    let userInfo = this.getCurrentUserInfo();
    console.log('AuthService - refreshCurrentUser from localStorage:', userInfo);
    
    if (!userInfo && this.hasToken()) {
      const token = this.getToken();
      if (token) {
        console.log('AuthService - Reconstruyendo userInfo desde token');
        userInfo = this.extractUserInfoFromToken(token);
        this.saveUserInfo(userInfo);
      }
    }
    
    console.log('AuthService - Final userInfo:', userInfo);
    this._currentUser.next(userInfo);
  }
  
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        const userInfo = this.extractUserInfoFromToken(response.token);
        this.saveUserInfo(userInfo);
        this._isAuthenticated.next(true);
        this._currentUser.next(userInfo);
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userInfoKey);
    }
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
  }

  public getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private saveToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private hasToken(): boolean {
    if (this.isBrowser()) {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  private extractUserInfoFromToken(token: string): UserInfo {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const roles = payload.roles || [];
      let role = roles.length > 0 ? roles[0].authority.replace('ROLE_', '') : 'USER';
      
      const roleUpper = role.toUpperCase();
      if (roleUpper.includes('TÉCNICO') || roleUpper.includes('TECNICO')) {
        role = 'Tecnico';
      } else if (roleUpper.includes('ASESOR')) {
        role = 'Asesor';
      } else if (roleUpper.includes('SUPERVISOR')) {
        role = 'Supervisor';
      }
      
      return {
        id: payload.idUsuario, 
        username: payload.sub,
        role: role,
        nombre: payload.nombre || '',
        apellido: payload.apellido || ''
      };
    } catch (error) {
      console.error('Error extracting user info from token:', error);
      return {
        id: 0,
        username: '',
        role: 'USER',
        nombre: '',
        apellido: ''
      };
    }
  }

  private saveUserInfo(userInfo: UserInfo): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
    }
  }

  public getCurrentUserInfo(): UserInfo | null {
    if (this.isBrowser()) {
      const userInfoStr = localStorage.getItem(this.userInfoKey);
      console.log('AuthService - userInfoStr from localStorage:', userInfoStr);
      
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          console.log('AuthService - parsed userInfo:', userInfo);
          return userInfo;
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      }
      
      const token = this.getToken();
      if (token) {
        console.log('AuthService - getCurrentUserInfo: Reconstruyendo desde token');
        const userInfo = this.extractUserInfoFromToken(token);
        this.saveUserInfo(userInfo);
        return userInfo;
      }
    }
    return null;
  }

  public getUserRole(): string | null {
    const userInfo = this.getCurrentUserInfo();
    return userInfo ? userInfo.role : null;
  }

  public isUserRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  public getUserFullName(): string {
    const userInfo = this.getCurrentUserInfo();
    if (userInfo && userInfo.nombre && userInfo.apellido) {
      return `${userInfo.nombre} ${userInfo.apellido}`;
    }
    return userInfo?.username || 'Usuario';
  }

  public getUserAvatar(): string | null {
    const userInfo = this.getCurrentUserInfo();
    if (userInfo && userInfo.id) {
      return `https://ui-avatars.com/api/?name=${userInfo.nombre}+${userInfo.apellido}&background=3b82f6&color=fff&rounded=true`;
    }
    return null;
  }

  public getUsername(): string {
    const userInfo = this.getCurrentUserInfo();
    return userInfo?.username || '';
  }
}
