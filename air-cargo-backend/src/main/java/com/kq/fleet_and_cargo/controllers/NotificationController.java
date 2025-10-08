package com.kq.fleet_and_cargo.controllers;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.kq.fleet_and_cargo.models.Notification;
import com.kq.fleet_and_cargo.payload.request.ReadNotificationRequest;
import com.kq.fleet_and_cargo.services.NotificationService;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/api/notifications")
@Slf4j
public record NotificationController(
        NotificationService notificationService
) {
    @PostMapping("/unread/{userId}")
    public ResponseEntity<String> readNotifications(@PathVariable("userId") String userId, @RequestBody ReadNotificationRequest notificationIds) {
        log.info("Marking notifications as read for user: {}", userId);
        log.info("Notification IDs: {}", notificationIds.getNotificationIds());
        return ResponseEntity.ok(notificationService.readNotifications(userId, notificationIds));
    }
    @PostMapping("/read/all/{userId}")
    public ResponseEntity<String> readAllNotifications(@PathVariable("userId") String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        return ResponseEntity.ok(notificationService.readAllNotifications(userId));
    }
    @GetMapping("/unread/{userId}/count")
    public ResponseEntity<Long> countUnreadNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.countUnreadNotifications(userId));
    }
    @GetMapping("/unread/{userId}")
    public ResponseEntity<Page<Notification>> getUnreadNotificationsByUserId(@PathVariable String userId,
                                                                             @RequestParam int page,
                                                                             @RequestParam int size) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsByUserId(userId, page, size));
    }
}
