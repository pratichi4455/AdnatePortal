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

  holidays: any[] = []; // Intentionally left empty to handle the "if not any then handle it in proper way" condition

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
    console.log('Logging in with', this.loginUsername);
    this.isLoggedIn = true;
    this.loginErrorMessage = '';
    this.closeLoginModal();
    this.loginUsername = '';
    this.loginPassword = '';
  }

  openApp(url: string): void {
    if (!this.isLoggedIn) {
      this.loginErrorMessage = 'Please log in to access this application.';
      this.openLoginModal();
      return;
    }
    window.open(url, '_blank');
  }
}
