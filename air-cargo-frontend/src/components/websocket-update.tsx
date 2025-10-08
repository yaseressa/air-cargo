import React, { useEffect } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { useNumberOfCargosCreated } from "@/utils/store";

const WebSocketNotification: React.FC = () => {
  const newCargoCountStore = useNumberOfCargosCreated();
  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => import.meta.env.VITE_BACKEND_SOCKET_URL,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket");

        stompClient.subscribe("/topic/cargo-notifications", (_: IMessage) => {
          newCargoCountStore.incrementNumberOfCargos();
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error: " + frame.headers["message"]);
        console.error("Details: " + frame.body);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
    };
  }, []);

  return <></>;
};

export { WebSocketNotification };
