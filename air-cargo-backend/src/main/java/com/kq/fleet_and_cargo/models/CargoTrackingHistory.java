package com.kq.fleet_and_cargo.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "cargo_tracking_history", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"location", "cargo_id"}, name = "unique_location_status")
})
public class CargoTrackingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @ManyToOne
    @JoinColumn(name = "cargo_id", nullable = false)
    @JsonIgnoreProperties({"trackingHistory", "files"})
    private Cargo cargo;
    private String location;
    private String description;
    @OneToMany(mappedBy = "trackingHistory", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("trackingHistory")
    private List<LuggageStatus> history;
    @JsonIgnoreProperties({"trackingHistory", "vehicles", "files", "notifications"})
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User createdBy;

    @CreationTimestamp

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu")
    private ZonedDateTime createdAt;
    @UpdateTimestamp
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu")
    private ZonedDateTime updatedAt;


}
