import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'ticket' | 'client' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private readonly STORAGE_KEY = 'crm_notifications';

  constructor() {
    this.loadFromStorage();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return new BehaviorSubject(this.notifications.filter(n => !n.isRead).length).asObservable();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      isRead: false
    };

    this.notifications.unshift(newNotification);
    this.limitNotifications();
    this.saveToStorage();
    this.notificationsSubject.next([...this.notifications]);
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveToStorage();
      this.notificationsSubject.next([...this.notifications]);
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.saveToStorage();
    this.notificationsSubject.next([...this.notifications]);
  }

  clearNotifications(): void {
    this.notifications = [];
    this.saveToStorage();
    this.notificationsSubject.next([]);
  }

  addTicketNotification(ticketId: string, description: string): void {
    this.addNotification({
      type: 'ticket',
      title: 'Nuevo ticket asignado',
      description: `Ticket #${ticketId} - ${description}`,
      data: { ticketId }
    });
  }

  addClientNotification(clientName: string, action: string): void {
    this.addNotification({
      type: 'client',
      title: 'Cliente actualizado',
      description: `${clientName} ${action}`,
      data: { clientName }
    });
  }

  addSystemNotification(title: string, description: string): void {
    this.addNotification({
      type: 'system',
      title,
      description
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private limitNotifications(): void {
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next([...this.notifications]);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      this.notifications = [];
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }
}