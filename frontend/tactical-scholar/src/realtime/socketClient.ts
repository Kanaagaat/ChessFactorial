type ConnectionState = "connecting" | "online" | "offline" | "reconnecting";

type ConnectionListener = (state: ConnectionState) => void;
type NotificationListener = (event: any) => void;

class TacticalSocketClient {
  private state: ConnectionState = "offline";
  private connectionListeners = new Set<ConnectionListener>();
  private notificationListeners = new Set<NotificationListener>();
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectTimeout: number | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
        this.connect();
    } else {
        this.disconnect();
    }
  }

  connect() {
    if (!this.token) return;
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
        return;
    }
    
    this.emitState("connecting");
    
    // Default WS URL assuming Django is on the same host but port 8000
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_BASE || `${wsProtocol}//127.0.0.1:8000`;
    
    this.ws = new WebSocket(`${wsHost}/ws/global/?token=${this.token}`);
    
    this.ws.onopen = () => {
        this.emitState("online");
        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    };
    
    this.ws.onclose = () => {
        this.emitState("offline");
        this.ws = null;
        if (this.token) {
            this.emitState("reconnecting");
            this.reconnectTimeout = window.setTimeout(() => this.connect(), 3000);
        }
    };
    
    this.ws.onerror = (error) => {
        console.error("WebSocket error", error);
    };
    
    this.ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            this.emitNotification(data);
        } catch (e) {
            console.error("Failed to parse websocket message", e);
        }
    };
  }

  disconnect() {
      this.token = null;
      if (this.reconnectTimeout) {
          window.clearTimeout(this.reconnectTimeout);
      }
      if (this.ws) {
          this.ws.close();
      }
  }

  simulateDisconnect() {
    if (this.ws) {
        this.ws.close();
    }
  }

  onConnectionState(listener: ConnectionListener) {
    this.connectionListeners.add(listener);
    listener(this.state);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  onNotification(listener: NotificationListener) {
      this.notificationListeners.add(listener);
      return () => {
          this.notificationListeners.delete(listener);
      }
  }

  private emitState(state: ConnectionState) {
    this.state = state;
    this.connectionListeners.forEach((listener) => listener(state));
  }
  
  private emitNotification(event: any) {
      this.notificationListeners.forEach((listener) => listener(event));
  }
}

export const socketClient = new TacticalSocketClient();
export type { ConnectionState };

