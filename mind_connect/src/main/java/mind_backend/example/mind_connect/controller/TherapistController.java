package mind_backend.example.mind_connect.controller;

import mind_backend.example.mind_connect.entity.Therapist;
import mind_backend.example.mind_connect.service.TherapistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/therapists")
@CrossOrigin(origins = "http://localhost:5173")
public class TherapistController {

    @Autowired
    private TherapistService therapistService;

    @GetMapping
    public List<Therapist> getAllTherapists() {
        return therapistService.getAllTherapists();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Therapist> getTherapistById(@PathVariable Long id) {
        return therapistService.getTherapistById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    public List<Therapist> getAvailableTherapists() {
        return therapistService.getAvailableTherapists();
    }

    @GetMapping("/specialization/{specialization}")
    public List<Therapist> getTherapistsBySpecialization(@PathVariable String specialization) {
        return therapistService.getTherapistsBySpecialization(specialization);
    }

    @PostMapping
    public ResponseEntity<?> createTherapist(@RequestBody Therapist therapist) {
        try {
            Therapist createdTherapist = therapistService.createTherapist(therapist);
            return ResponseEntity.ok(createdTherapist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTherapist(@PathVariable Long id, @RequestBody Therapist therapist) {
        try {
            System.out.println("Updating therapist with ID: " + id);
            System.out.println("Therapist data: " + therapist);
            Therapist updatedTherapist = therapistService.updateTherapist(id, therapist);
            System.out.println("Therapist updated successfully: " + updatedTherapist.getId());
            return ResponseEntity.ok(updatedTherapist);
        } catch (Exception e) {
            System.err.println("Error updating therapist: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id, @RequestBody Boolean available) {
        try {
            Therapist updatedTherapist = therapistService.updateAvailability(id, available);
            return ResponseEntity.ok(updatedTherapist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTherapist(@PathVariable Long id) {
        try {
            therapistService.deleteTherapist(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
