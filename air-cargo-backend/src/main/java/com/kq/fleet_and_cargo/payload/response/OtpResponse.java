package com.kq.fleet_and_cargo.payload.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OtpResponse {
    private boolean isOtpValid;

}
