import { eventEmitter } from "@/lib/events";

// GET /api/events - SSE endpoint for real-time updates
export async function GET(request) {
  // Create a ReadableStream for Server-Sent Events
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Create a client object that wraps the controller
      const client = {
        write: (data) => {
          controller.enqueue(encoder.encode(data));
        },
      };

      // Add client to event emitter
      eventEmitter.addClient(client);

      // Send initial connection message
      client.write(`: Connected to news article updates\n\n`);

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          client.write(`: heartbeat\n\n`);
        } catch (error) {
          clearInterval(heartbeatInterval);
          eventEmitter.removeClient(client);
        }
      }, 30000);

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        eventEmitter.removeClient(client);
        controller.close();
      });
    },
  });

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
