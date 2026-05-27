import { Component, OnInit } from '@angular/core';

interface AppItem {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
}

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class PortalComponent implements OnInit {
  showLoginModal: boolean = false;
  loginUsername: string = '';
  loginPassword: string = '';
  isLoggedIn: boolean = false;
  loginErrorMessage: string = '';

  applications: AppItem[] = [
    {
      id: 'asset-manager',
      name: 'Asset Manager',
      icon: 'inventory_2',
      url: 'http://localhost:4200/asset-manager',
      color: '#3b82f6'
    },
    {
      id: 'hr-portal',
      name: 'HR Portal',
      icon: 'groups',
      url: 'http://localhost:4200/hr',
      color: '#10b981'
    },
    {
      id: 'helpdesk',
      name: 'IT Helpdesk',
      icon: 'support_agent',
      url: 'http://localhost:4200/helpdesk',
      color: '#f59e0b'
    },
    {
      id: 'finance',
      name: 'Finance & Payroll',
      icon: 'payments',
      url: 'http://localhost:4200/finance',
      color: '#8b5cf6'
    },
    {
      id: 'learning',
      name: 'Learning Hub',
      icon: 'school',
      url: 'http://localhost:4200/learning',
      color: '#ef4444'
    },
    {
      id: 'directory',
      name: 'Company Directory',
      icon: 'contact_phone',
      url: 'http://localhost:4200/directory',
      color: '#06b6d4'
    }
  ];

  ngOnInit(): void {
    // Show login modal on fresh load
    setTimeout(() => {
      this.showLoginModal = true;
    }, 300);
  }

  openLoginModal(): void {
    this.showLoginModal = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    this.loginErrorMessage = ''; // clear error on close
  }

  handleLogin(event: Event): void {
    event.preventDefault();
    // Placeholder login logic
    console.log('Logging in with', this.loginUsername);
    this.isLoggedIn = true;
    this.loginErrorMessage = '';
    // Close modal on successful login
    this.closeLoginModal();
    // Optionally reset fields
    this.loginUsername = '';
    this.loginPassword = '';
  }

  openApp(url: string): void {
    if (!this.isLoggedIn) {
      this.loginErrorMessage = 'Please log in to access this application.';
      this.openLoginModal();
      return;
    }
    // For a real SSO scenario, this might open a new tab or redirect
    // window.location.href = url;
    window.open(url, '_blank');
  }
}
