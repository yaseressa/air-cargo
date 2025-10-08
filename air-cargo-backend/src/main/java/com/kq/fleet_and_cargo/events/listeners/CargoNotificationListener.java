package com.kq.fleet_and_cargo.events.listeners;


import com.kq.fleet_and_cargo.events.CargoAddedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CargoNotificationListener {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleCargoAddedEvent(CargoAddedEvent event) {
        messagingTemplate.convertAndSend("/topic/cargo-notifications", "New cargo added");
    }
}