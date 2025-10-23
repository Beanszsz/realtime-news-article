// Event emitter for Server-Sent Events (SSE)
// This allows us to broadcast article changes to all connected clients

class EventEmitter {
  constructor() {
    this.clients = new Set();
  }

  addClient(client) {
    this.clients.add(client);
    console.log(`Client connected. Total clients: ${this.clients.size}`);
  }

  removeClient(client) {
    this.clients.delete(client);
    console.log(`Client disconnected. Total clients: ${this.clients.size}`);
  }

  emit(event, data) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    // Send to all connected clients
    this.clients.forEach((client) => {
      try {
        client.write(message);
      } catch (error) {
        console.error("Error sending to client:", error);
        this.removeClient(client);
      }
    });

    console.log(`Broadcasted ${event} to ${this.clients.size} clients`);
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter();

// Event types
export const EVENTS = {
  ARTICLE_CREATED: "article:created",
  ARTICLE_UPDATED: "article:updated",
  ARTICLE_DELETED: "article:deleted",
};
