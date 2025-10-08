package com.kq.fleet_and_cargo.amqp;

import com.kq.fleet_and_cargo.payload.dto.WhatsappMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMqProducer {
    private final AmqpTemplate amqpTemplate;

    public void sendWhatsappCustomer(WhatsappMessage whatsappMessage, String routingKey, String exchange) {
        amqpTemplate.convertAndSend(exchange, routingKey, whatsappMessage);
    }

    public void sendOTP(String email, String otp, String routingKey, String exchange) {
        amqpTemplate.convertAndSend(exchange, routingKey, email + ":" + otp);
    }
}
