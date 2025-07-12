package mind_backend.example.mind_connect.service;

import mind_backend.example.mind_connect.entity.Notification;
import mind_backend.example.mind_connect.entity.Session;
import mind_backend.example.mind_connect.entity.User;
import mind_backend.example.mind_connect.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    // Helper methods for creating session notifications
    public void createSessionCancelledNotification(Session session, String reason) {
        Notification notification = new Notification();
        notification.setUser(session.getUser());
        notification.setSession(session);
        notification.setType(Notification.NotificationType.SESSION_CANCELLED);
        notification.setTitle("Session Cancelled");
        notification.setMessage("Your session with Dr. " + session.getTherapist().getLastName() + 
                             " has been cancelled. Reason: " + reason);
        
        notificationRepository.save(notification);
    }

    public void createSessionRescheduledNotification(Session session, String newDate) {
        Notification notification = new Notification();
        notification.setUser(session.getUser());
        notification.setSession(session);
        notification.setType(Notification.NotificationType.SESSION_RESCHEDULED);
        notification.setTitle("Session Rescheduled");
        notification.setMessage("Your session with Dr. " + session.getTherapist().getLastName() + 
                             " has been rescheduled to " + newDate);
        
        notificationRepository.save(notification);
    }

    public void createSessionCompletedNotification(Session session) {
        Notification notification = new Notification();
        notification.setUser(session.getUser());
        notification.setSession(session);
        notification.setType(Notification.NotificationType.SESSION_COMPLETED);
        notification.setTitle("Session Completed");
        notification.setMessage("Your session with Dr. " + session.getTherapist().getLastName() + 
                             " has been marked as completed. Thank you for your time!");
        
        notificationRepository.save(notification);
    }
} 