package com.kq.fleet_and_cargo.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.kq.fleet_and_cargo.enums.LuggageStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LuggageStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private LuggageStatusEnum status;
    @ManyToOne
    @JoinColumn(name = "cargo_tracking_history_id", nullable = false)
    @JsonIgnoreProperties("history")
    private CargoTrackingHistory trackingHistory;

    @CreationTimestamp
    
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu") private ZonedDateTime createdAt;
}
