package com.kq.fleet_and_cargo.events;

import org.springframework.context.ApplicationEvent;

public class CargoAddedEvent extends ApplicationEvent {
    public CargoAddedEvent(Object source) {
        super(source);
    }

}
