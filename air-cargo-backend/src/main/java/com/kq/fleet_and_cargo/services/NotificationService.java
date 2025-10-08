package com.kq.fleet_and_cargo.services;

import com.kq.fleet_and_cargo.models.Notification;
import com.kq.fleet_and_cargo.payload.request.ReadNotificationRequest;
import com.kq.fleet_and_cargo.repositories.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public record NotificationService(NotificationRepository notificationRepository) {
   public Page<Notification> getUnreadNotificationsByUserId(String userId, int page, int size) {
       Pageable pageable = PageRequest.of(page, size);
       return notificationRepository.getUnreadNotificationsByUserId(userId, pageable);
   }

   public String readNotifications(String userId, ReadNotificationRequest notificationIds) {
       List<Notification> notifications = notificationRepository.findAllById(notificationIds.getNotificationIds());
       for (Notification notification : notifications) {
           if (notification.getUsers().stream().anyMatch(user -> user.getId().equals(userId))) {
               notification.setRead(true);
           }
       }
       notificationRepository.saveAll(notifications);
       return "Notifications marked as read";
   }
   public String readAllNotifications(String userId) {
       List<Notification> notifications = notificationRepository.findAllByUsersId(userId);
       for (Notification notification : notifications) {
           notification.setRead(true);
       }
       notificationRepository.saveAll(notifications);
       return "All notifications marked as read";
   }
   public Long countUnreadNotifications(String userId) {
       return notificationRepository.countUnreadNotificationsByUserId(userId);
   }
}
