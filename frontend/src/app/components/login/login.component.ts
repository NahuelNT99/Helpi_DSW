import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username!: string;
  password!: string;
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.errorMessage = null;
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        const userRole = this.authService.getUserRole();
        if (userRole === 'Supervisor') {
      this.router.navigate(['/dashboard']); 
        } else {
          this.router.navigate(['/']); 
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
      }
    });
  }
}
