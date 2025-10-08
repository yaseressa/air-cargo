import { useEffect } from "react";
import { Client, IMessage } from "@stomp/stompjs";

export const useWebSocket = (
  url: string, // Use 'ws://13.115.172.75:8085/ws'
  topic: string,
  onMessage: (message: IMessage) => void
) => {
  useEffect(() => {
    const stompClient = new Client({
      brokerURL: url,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(topic, onMessage);
      },
      onStompError: (frame) => {
        console.error("STOMP error: " + frame.headers["message"]);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
    };
  }, [url, topic, onMessage]);
};
