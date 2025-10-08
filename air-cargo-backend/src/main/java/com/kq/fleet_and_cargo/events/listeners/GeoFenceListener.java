package com.kq.fleet_and_cargo.events.listeners;

import com.kq.fleet_and_cargo.events.GeoFenceEvent;
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
public class GeoFenceListener {
    private final SimpMessagingTemplate messagingTemplate;
    @EventListener
    public void handleNotification(GeoFenceEvent event) {

            messagingTemplate.convertAndSend("/topic/geofence-update/" + ((Notification)event.getSource()).getAssociatedId(), event.getSource());
        }
    }

