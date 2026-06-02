import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  // Tab State
  activeTab: string = 'quick-links'; // 'quick-links' or 'news'

  // Quick Link Form Model
  quickLink = {
    name: '',
    description: '',
    icon: 'inventory_2',
    color: '#4f46e5',
    bgColor: '#e0e7ff',
    access: 'All'
  };

  // News Form Model
  newsItem = {
    title: '',
    description: '',
    date: '',
    icon: 'newspaper',
    bgColor: '#ebedee'
  };

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  saveQuickLink() {
    console.log('Save Quick Link payload:', this.quickLink);
    // API call will be placed here
    alert('Quick Link payload saved (Check Console)');
  }

  saveNewsItem() {
    console.log('Save News Item payload:', this.newsItem);
    // API call will be placed here
    alert('News Item payload saved (Check Console)');
  }
}
