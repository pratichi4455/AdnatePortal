import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatbotService {
  private genAI: any;
  private chatSession: any;
  
  // Storing the provided Gemini API key
  private apiKey: string = 'AIzaSyBmVWAhlUZ2grWehWVpEQYZaxH0OzJ_XBc';

  constructor() {
    this.initSDK();
  }

  private initSDK() {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.resetChat();
    } catch (error) {
      console.error('Failed to initialize Google Generative AI SDK', error);
    }
  }

  /**
   * Resets the chat session and sets the system prompt.
   */
  public resetChat() {
    if (!this.genAI) return;
    
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are the official HR AI Assistant for ADNATE IT Solutions. 
        Your tone is friendly, professional, helpful, and concise.
        You help employees with HR-related topics including:
        - Leave Policies (Casual Leave, Sick Leave, Maternity/Paternity Leave, Earned Leave)
        - Company holidays and timings (9 AM - 6 PM, Monday to Friday)
        - Dress code, workplace policies, benefits, and workplace guidelines.
        - General HR contact information and common workflow help.
        
        Keep your answers clear and relatively short so they fit nicely in a chat bubble.
        If a question is completely outside the scope of HR or corporate rules, politely remind the employee that you are only trained to help with HR queries.`
    });

    this.chatSession = model.startChat({
      history: []
    });
  }

  /**
   * Sends a message to Gemini and returns the AI's textual response.
   */
  async sendMessage(messageText: string): Promise<string> {
    if (!this.chatSession) {
      this.initSDK();
    }
    
    try {
      const result = await this.chatSession.sendMessage(messageText);
      const response = await result.response;
      return response.text() || "Sorry, I encountered an issue parsing the response.";
    } catch (error) {
      console.error('Error communicating with Gemini API:', error);
      throw new Error('Could not connect to HR AI. Please verify your API Key and internet connection.');
    }
  }
}
