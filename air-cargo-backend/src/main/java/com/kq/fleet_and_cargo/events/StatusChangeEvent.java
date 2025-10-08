package com.kq.fleet_and_cargo.events;


import com.kq.fleet_and_cargo.models.Notification;
import org.springframework.context.ApplicationEvent;

public class StatusChangeEvent extends ApplicationEvent {
    public StatusChangeEvent(Object source) {
        super(source);
    }

}