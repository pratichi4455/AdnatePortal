import { Component, OnInit, HostListener } from '@angular/core';
import { AiChatbotService, ChatMessage } from '../../core/services/ai-chatbot.service';
import { HeroService } from '../../core/services/hero.service';

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
  loggedInUser: string = '';
  isProfileDropdownOpen: boolean = false;

  // Logged In User details
  userRoleId: string = '';
  userRoleName: string = '';
  userDisplayName: string = '';
  userEmail: string = '';

  holidays: any[] = []; // Intentionally left empty to handle the "if not any then handle it in proper way" condition
  quickLinks: any[] = [];
  newsList: any[] = [];
  userTypeStr: string = '';

  // Chatbot State
  isChatOpen: boolean = false;
  chatMessages: ChatMessage[] = [];
  userMessage: string = '';
  isAiLoading: boolean = false;

  constructor(
    private aiChatbotService: AiChatbotService,
    private heroService: HeroService
  ) { }

  ngOnInit(): void {
    // Show login modal on fresh load
    setTimeout(() => {
      this.showLoginModal = true;
    }, 300);
    this.initializeChat();
    this.fetchQuickLinks();
    this.fetchNewsAnnouncements();
  }

  initializeChat(): void {
    this.chatMessages = [
      {
        sender: 'ai',
        text: 'Hello! I am your ADNATE HR AI Assistant. How can I help you today?',
        timestamp: new Date()
      }
    ];
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

    this.heroService.setCredentials(this.loginUsername, this.loginPassword);

    this.heroService.ajax(
      'GetLoggedInUserRole',
      'http://schemas.cordys.com/AW_Database_Metadata',
      {
        preserveSpace: 'no',
        qAccess: '0',
        qValues: '',
        email: this.loginUsername,
        password: this.loginPassword
      }
    ).then((resp: any) => {
      console.log('Login response:', resp);
      const user = this.heroService.xmltojson(resp, 'm_users');
      console.log('Parsed user JSON:', user);

      if (user && user.name) {
        // Successful login
        this.loggedInUser = user.name;
        this.userDisplayName = user.name;
        this.userEmail = user.email || this.loginUsername;

        // Extract role details
        if (user.m_roles) {
          this.userRoleId = user.m_roles.role_id || user.role_id || '';
          this.userRoleName = user.m_roles.role_name || '';
        } else {
          this.userRoleId = user.role_id || '';
          this.userRoleName = 'Employee'; // fallback
        }

        this.isLoggedIn = true;
        this.userTypeStr = user.type || (this.userEmail.toLowerCase().includes('external') ? 'External' : 'Internal');
        this.loginErrorMessage = '';
        this.closeLoginModal();
        this.loginUsername = '';
        this.loginPassword = '';
        this.fetchNewsAnnouncements();
      } else {
        this.loginErrorMessage = 'Invalid credentials or user not found.';
      }
    }).catch((err: any) => {
      console.error('Login error response:', err);
      this.loginErrorMessage = 'Failed to sign in. Check credentials and try again.';
    });
  }

  openApp(url: string): void {
    if (!this.isLoggedIn) {
      this.loginErrorMessage = 'Please log in to access this application.';
      this.openLoginModal();
      return;
    }
    window.open(url, '_blank');
  }

  toggleChat(): void {
    if (!this.isLoggedIn) {
      this.loginErrorMessage = 'Please log in to chat with the HR Assistant.';
      this.openLoginModal();
      return;
    }
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.scrollToBottom();
    }
  }

  async sendChatMessage(): Promise<void> {
    if (!this.userMessage.trim() || this.isAiLoading) return;

    const messageText = this.userMessage.trim();
    this.userMessage = ''; // Clear input

    // 1. Add User Message to Chat History
    this.chatMessages.push({
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    });

    // 2. Set Loading State
    this.isAiLoading = true;
    this.scrollToBottom();

    try {
      // 3. Request Gemini AI Response
      const aiResponseText = await this.aiChatbotService.sendMessage(messageText);

      // 4. Add AI Message to Chat History
      this.chatMessages.push({
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      });
    } catch (error: any) {
      this.chatMessages.push({
        sender: 'ai',
        text: error.message || 'An error occurred while reaching the AI assistant.',
        timestamp: new Date()
      });
    } finally {
      this.isAiLoading = false;
      this.scrollToBottom();
    }
  }

  resetChatHistory(): void {
    this.aiChatbotService.resetChat();
    this.initializeChat();
  }

  get userFullName(): string {
    return this.userDisplayName || this.loggedInUser || 'Emma Reynolds';
  }

  toggleProfileDropdown(event: MouseEvent): void {
    if (this.isLoggedIn) {
      event.stopPropagation();
      this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    } else {
      this.openLoginModal();
    }
  }

  logout(): void {
    this.isLoggedIn = false;
    this.loggedInUser = '';
    this.userDisplayName = '';
    this.userEmail = '';
    this.userRoleId = '';
    this.userRoleName = '';
    this.userTypeStr = '';
    this.heroService.clearCredentials();
    this.isProfileDropdownOpen = false;
    this.showLoginModal = true;
    this.fetchNewsAnnouncements();
  }

  fetchQuickLinks(): void {
    this.heroService.ajax(
      'GetAllQuickLinks',
      'http://schemas.cordys.com/AW_Database_Metadata',
      {
        preserveSpace: 'no',
        qAccess: '0',
        qValues: ''
      }
    ).then((resp: any) => {
      console.log('Portal GetAllQuickLinks raw response:', resp);
      const result = this.heroService.xmltojson(resp, 'quick_links_master');
      console.log('Portal GetAllQuickLinks parsed JSON:', result);

      let list = [];
      if (!result) {
        list = [];
      } else if (Array.isArray(result)) {
        list = result;
      } else {
        list = [result];
      }

      const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
      const bgColors = ['#e0e7ff', '#d1fae5', '#fef3c7', '#fee2e2', '#ede9fe', '#fce7f3', '#cffafe'];
      const icons = ['inventory_2', 'people_alt', 'link', 'public', 'description', 'extension', 'language'];

      this.quickLinks = list
        .filter((item: any) => item.status !== 'Inactive')
        .map((item: any, idx: number) => {
          const colorIdx = idx % colors.length;
          return {
            id: item.id,
            name: item.linkdescription || 'Quick Link',
            description: item.linkheader || '',
            url: item.linkheader || '',
            icon: icons[colorIdx % icons.length],
            color: colors[colorIdx],
            bgColor: bgColors[colorIdx]
          };
        });
    }).catch((err: any) => {
      console.error('Error fetching quick links in portal:', err);
    });
  }

  openQuickLink(url: string): void {
    if (!url) return;
    let targetUrl = url.trim();

    if (targetUrl.toLowerCase().includes('ams/index.html') || targetUrl.toLowerCase().includes('/ams/') || targetUrl.toLowerCase().includes('ams')) {
      const role = (this.userRoleName || '').trim().toLowerCase();
      console.log('AMS Link Clicked. Role:', this.userRoleName);

      if (role === 'admin') {
        targetUrl = 'http://43.242.214.239:81/home/training2025/AMS/index.html#/admin/dashboard';
      } else if (role === 'asset manager') {
        targetUrl = 'http://43.242.214.239:81/home/training2025/AMS/index.html#/asset-manager/dashboard';
      } else if (role === 'employee') {
        targetUrl = 'http://43.242.214.239:81/home/training2025/AMS/index.html#/employee/my-assets';
      } else if (role === 'team lead') {
        targetUrl = 'http://43.242.214.239:81/home/training2025/AMS/index.html#/team-lead/dashboard';
      } else if (role === 'asset allocation team') {
        targetUrl = 'http://43.242.214.239:81/home/training2025/AMS/index.html#/admin/dashboard';
      } else {
        targetUrl = 'http://43.242.214.239:81/home/training2025/AMS/index.html#/employee/my-assets';
      }

      console.log('Final target URL:', targetUrl);
      alert('Opening AMS URL: ' + targetUrl);
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'http://' + targetUrl;
    }
    window.open(targetUrl, '_blank');
  }

  getRoleSlug(roleName: string): string {
    if (!roleName) return 'employee';
    return roleName.toLowerCase().trim().replace(/\s+/g, '-');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.isProfileDropdownOpen = false;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('chat-body-scroll');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  fetchNewsAnnouncements(): void {
    const typeValue = this.isLoggedIn ? (this.userTypeStr || 'Internal') : 'External';
    this.heroService.ajax(
      'GetAllNewsAnnouncementsfortype',
      'http://schemas.cordys.com/AW_Database_Metadata',
      {
        preserveSpace: 'no',
        qAccess: '0',
        qValues: '',
        Type: typeValue
      }
    ).then((resp: any) => {
      const result = this.heroService.xmltojson(resp, 'news_announcements');
      if (!result) {
        this.newsList = [];
      } else if (Array.isArray(result)) {
        this.newsList = result;
      } else {
        this.newsList = [result];
      }
      console.log('Fetched news announcements for type', typeValue, this.newsList);
    }).catch((err: any) => {
      console.error('Error fetching news announcements:', err);
    });
  }

  getTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }
}

