package com.kq.fleet_and_cargo.events;

import org.springframework.context.ApplicationEvent;

public class GeoFenceEvent extends ApplicationEvent {
    public GeoFenceEvent(Object source) {
        super(source);
    }

}