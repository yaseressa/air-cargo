package com.kq.fleet_and_cargo.events.listeners;

import com.kq.fleet_and_cargo.events.CargoAddedEvent;
import com.kq.fleet_and_cargo.events.StatusChangeEvent;
import com.kq.fleet_and_cargo.models.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StatusChangeListener {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleNotification(StatusChangeEvent event) {
        for(val u : ((Notification)event.getSource()).getUsers()){
            log.info("Sending notification to user: {}", u.getId());
            messagingTemplate.convertAndSend("/topic/notifications/" + u.getId(), event.getSource());
        }
    }
}