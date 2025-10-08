package com.kq.fleet_and_cargo.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@Entity
public class FXRates {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String sourceCurrency;
    private String destinationCurrency;
    private Double rate;
    @CreationTimestamp
    
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Africa/Mogadishu") private ZonedDateTime createdAt;
}
