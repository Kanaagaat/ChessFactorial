type ConnectionState = "connecting" | "online" | "offline" | "reconnecting";

type Listener = (state: ConnectionState) => void;

class TacticalSocketClient {
  private state: ConnectionState = "connecting";
  private listeners = new Set<Listener>();

  connect() {
    this.emit("connecting");
    window.setTimeout(() => this.emit("online"), 700);
  }

  simulateDisconnect() {
    this.emit("offline");
    window.setTimeout(() => this.emit("reconnecting"), 1200);
    window.setTimeout(() => this.emit("online"), 2200);
  }

  onConnectionState(listener: Listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(state: ConnectionState) {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }
}

export const socketClient = new TacticalSocketClient();
export type { ConnectionState };
