package com.kq.fleet_and_cargo.enums;


import lombok.Getter;

@Getter
public enum LuggageStatusEnum {
    CHECKED_IN("Checked In"),       // Luggage has been checked in at the counter.
    IN_TRANSIT("In Transit"),       // Luggage is currently being transported.
    ARRIVED("Arrived"),
    IN_OFFICE("In Office"),// Luggage has arrived at the destination.
    LOST("Lost"),                   // Luggage is reported as lost.
    DELIVERED("Delivered"),         // Luggage has been delivered to the owner.
    PENDING("Pending"),             // Luggage status is still being determined.
    DAMAGED("Damaged"),             // Luggage has been damaged.
    RETRIEVED("Retrieved"),         // Luggage has been picked up by the owner.
    ON_HOLD("On Hold"),             // Luggage is being held for some reason (e.g., customs clearance).
    CUSTOMS_CHECK("Customs Check"); // Luggage is under customs inspection.

    private final String status;

    LuggageStatusEnum(String status) {
        this.status = status;
    }

}
