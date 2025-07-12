package mind_backend.example.mind_connect.service;

import mind_backend.example.mind_connect.entity.Session;
import mind_backend.example.mind_connect.entity.Session.SessionStatus;
import mind_backend.example.mind_connect.repository.SessionRepository;
import mind_backend.example.mind_connect.repository.UserRepository;
import mind_backend.example.mind_connect.repository.TherapistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TherapistRepository therapistRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    public Optional<Session> getSessionById(Long id) {
        return sessionRepository.findById(id);
    }

    public List<Session> getSessionsByUserId(Long userId) {
        return sessionRepository.findByUserId(userId);
    }

    public List<Session> getSessionsByTherapistId(Long therapistId) {
        return sessionRepository.findByTherapistId(therapistId);
    }

    public List<Session> getSessionsByStatus(SessionStatus status) {
        return sessionRepository.findByStatus(status);
    }

    public Session createSession(Session session) {
        // Validate user and therapist exist
        userRepository.findById(session.getUser().getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        therapistRepository.findById(session.getTherapist().getId())
            .orElseThrow(() -> new RuntimeException("Therapist not found"));

        return sessionRepository.save(session);
    }

    public Session updateSession(Long id, Session sessionDetails) {
        Session session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Session not found"));

        // Check if session date changed (rescheduling)
        boolean isRescheduled = !session.getSessionDate().equals(sessionDetails.getSessionDate());
        
        session.setSessionDate(sessionDetails.getSessionDate());
        session.setStatus(sessionDetails.getStatus());
        session.setNotes(sessionDetails.getNotes());
        session.setSessionType(sessionDetails.getSessionType());
        session.setDuration(sessionDetails.getDuration());

        Session updatedSession = sessionRepository.save(session);

        // Create notification if session was rescheduled
        if (isRescheduled) {
            String newDate = sessionDetails.getSessionDate().toString();
            notificationService.createSessionRescheduledNotification(updatedSession, newDate);
        }

        return updatedSession;
    }

    public Session updateSessionStatus(Long id, SessionStatus status) {
        Session session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        SessionStatus oldStatus = session.getStatus();
        session.setStatus(status);
        Session updatedSession = sessionRepository.save(session);

        // Create notifications based on status change
        if (status == SessionStatus.CANCELLED && oldStatus != SessionStatus.CANCELLED) {
            String reason = session.getNotes() != null ? session.getNotes() : "No reason provided";
            notificationService.createSessionCancelledNotification(updatedSession, reason);
        } else if (status == SessionStatus.COMPLETED && oldStatus != SessionStatus.COMPLETED) {
            notificationService.createSessionCompletedNotification(updatedSession);
        }

        return updatedSession;
    }

    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    public List<Session> getUpcomingSessions(Long userId) {
        return sessionRepository.findByUserIdAndStatus(userId, SessionStatus.SCHEDULED);
    }

    public List<Session> getSessionsInDateRange(LocalDateTime start, LocalDateTime end) {
        return sessionRepository.findBySessionDateBetween(start, end);
    }
}
