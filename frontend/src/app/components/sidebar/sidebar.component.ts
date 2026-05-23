import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() navigationChange = new EventEmitter<string>();

  isSupervisor: boolean = false;
  isTecnico: boolean = false;
  activeTab: string = 'overview';
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        if (user && user.role) {
          this.isSupervisor = user.role === 'Supervisor';
          this.isTecnico = user.role === 'Tecnico';
        } else {
          this.isSupervisor = false;
          this.isTecnico = false;
        }
      })
    );
    
    if (!this.isSupervisor && !this.isTecnico) {
      this.activeTab = 'clients';
    } else if (this.isTecnico) {
      this.activeTab = 'tickets';
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  navigateTo(section: string) {
    this.activeTab = section;
    this.navigationChange.emit(section);
  }
}
