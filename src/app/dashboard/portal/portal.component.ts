import { Component, OnInit } from '@angular/core';
import { AiChatbotService, ChatMessage } from '../../core/services/ai-chatbot.service';

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

  // Chatbot State
  isChatOpen: boolean = false;
  chatMessages: ChatMessage[] = [];
  userMessage: string = '';
  isAiLoading: boolean = false;

  constructor(private aiChatbotService: AiChatbotService) {}

  ngOnInit(): void {
    // Show login modal on fresh load
    setTimeout(() => {
      this.showLoginModal = true;
    }, 300);
    this.initializeChat();
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

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('chat-body-scroll');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }
}

