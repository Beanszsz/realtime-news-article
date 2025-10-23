"use client";

import { useEffect, useRef, useState } from "react";

export function useSSE(url) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const listenersRef = useRef({});

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("SSE Connected");
      setIsConnected(true);
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url]);

  const addEventListener = (eventType, callback) => {
    if (!eventSourceRef.current) return;

    const handler = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    eventSourceRef.current.addEventListener(eventType, handler);
    listenersRef.current[eventType] = handler;

    // Return cleanup function
    return () => {
      if (eventSourceRef.current && listenersRef.current[eventType]) {
        eventSourceRef.current.removeEventListener(
          eventType,
          listenersRef.current[eventType],
        );
        delete listenersRef.current[eventType];
      }
    };
  };

  return { isConnected, addEventListener };
}
