import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  showDropdown = false;
  showNotifications = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  get userFullName(): string {
    return this.authService.getUserFullName();
  }

  get userRole(): string {
    return this.authService.getUserRole() || 'Usuario';
  }

  get userAvatar(): string {
    return this.authService.getUserAvatar() || 'assets/images/default-avatar.png';
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.showNotifications = false;
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showDropdown = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  closeDropdown() {
    this.showDropdown = false;
    this.showNotifications = false;
  }

  toggleNotificationsPanel() {
    this.showNotifications = !this.showNotifications;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.notificationService.getNotifications().subscribe(notifications => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.isRead).length;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  getTimeAgo(timestamp: Date): string {
    return this.notificationService.getTimeAgo(timestamp);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'ticket': return 'confirmation_number';
      case 'client': return 'person';
      case 'system': return 'info';
      default: return 'notifications';
    }
  }
}
