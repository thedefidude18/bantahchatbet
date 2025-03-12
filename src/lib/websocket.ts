import { supabase } from './supabase';

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.authenticate(user.id);
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        this.messageHandlers.forEach(handler => handler(data.message));
      }
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 1000);
    };
  }

  private authenticate(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'auth',
        userId
      }));
    }
  }

  public sendMessage(receiverId: string, content: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'chat',
        receiverId,
        content
      }));
    }
  }

  public onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }
}

export const webSocketService = new WebSocketService();