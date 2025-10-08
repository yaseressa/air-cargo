package com.kq.fleet_and_cargo.repositories;

import com.kq.fleet_and_cargo.models.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    @Query("SELECT n FROM Notification n " +
            "JOIN n.users u " +
            "WHERE u.id = :userId  order by n.createdAt desc")
    Page<Notification> getUnreadNotificationsByUserId(String userId, Pageable pageable);
    @Query(
            "SELECT COUNT(n) FROM Notification n " +
            "JOIN n.users u " +
            "WHERE u.id = :userId AND n.isRead = false"
    )
    Long countUnreadNotificationsByUserId(String userId);




    @Query("SELECT n FROM Notification n " +
            "WHERE n.associatedId = :geofenceId AND " +
            "(lower(n.message) LIKE concat('%', lower(:search), '%'))")
    Page<Notification> findAllByGeofenceIdAndSearch(@Param("geofenceId") String geofenceId, @Param("search") String search, Pageable pageable);

    @Query("SELECT n FROM Notification n " +
            "JOIN n.users u " +
            "WHERE u.id = :userId")
    List<Notification> findAllByUsersId(@Param("userId") String userId);
}
