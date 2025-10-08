package com.kq.fleet_and_cargo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class WhatsappSenderService  {

    @Value("${whatsapp.api.url}")
    private String whatsappApiUrl;

    @Value("${whatsapp.api.token}")
    private String whatsappApiToken;

    private final RestTemplate restTemplate;

    public WhatsappSenderService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
    }

    public void sendTextMessage(String to, String message) {
        Map<String, Object> payload = Map.of(
                "to", to,
                "type", "text",
                "text", Map.of("body", message)
        );

        sendRequest(payload);
    }

    public void sendMediaMessage(String to, String mediaUrl, String caption) {
        Map<String, Object> payload = Map.of(
                "to", to,
                "type", "image",
                "image", Map.of(
                        "link", mediaUrl,
                        "caption", caption
                )
        );

        sendRequest(payload);
    }

    private void sendRequest(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(whatsappApiToken);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(whatsappApiUrl, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to send WhatsApp message: " + response.getBody());
        }
    }
}
