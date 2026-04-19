package com.smartpresence.repository;

import com.smartpresence.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    Page<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    long countByRecipientUserIdAndIsRead(Integer userId, Boolean isRead);

    Page<Notification> findByRecipientUserIdAndIsReadOrderByCreatedAtDesc(
            Integer userId, Boolean isRead, Pageable pageable);
}
