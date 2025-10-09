package com.kq.fleet_and_cargo.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Cargo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @SequenceGenerator(name = "cargo_reference_seq", sequenceName = "cargo_reference_seq", allocationSize = 1)
    @Column(unique = true, updatable = false)
    private Long referenceNumber;
    private double weight;
    private String pickupLocation;
    private String destination;
    private String description;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "cargo_id")
    private List<File> files = new ArrayList<>();
    @ManyToOne
    @JsonIgnoreProperties({ "sentCargo", "receivedCargo" })
    private Customer sender;
    @ManyToOne
    @JsonIgnoreProperties({ "sentCargo", "receivedCargo" })
    private Customer receiver;
    private String cargoType;
    private int quantity;
    @OneToMany(mappedBy = "cargo", cascade = CascadeType.ALL)
    private List<CargoTrackingHistory> trackingHistory = new ArrayList<>();
    @Embedded
    private Money price;

    @UpdateTimestamp

    private ZonedDateTime updatedAt;

    @CreationTimestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu")
    private ZonedDateTime createdAt;

    public double getTotalWeight() {
        return weight * quantity;
    }

}