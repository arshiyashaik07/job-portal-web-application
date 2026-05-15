package job_portal_api.controller;

import job_portal_api.model.JobApplication;
import job_portal_api.repository.JobApplicationRepository;
import job_portal_api.repository.JobRepository;
import job_portal_api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public ApplicationController(
            JobApplicationRepository applicationRepository,
            UserRepository userRepository,
            JobRepository jobRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyForJob(@RequestBody JobApplication application) {

        if (!userRepository.existsById(application.getUserId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        if (!jobRepository.existsById(application.getJobId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Job not found"));
        }

        boolean alreadyApplied = applicationRepository.existsByUserIdAndJobId(
                application.getUserId(),
                application.getJobId()
        );

        if (alreadyApplied) {
            return ResponseEntity.badRequest().body(Map.of("message", "You already applied for this job"));
        }

        application.setStatus("APPLIED");
        application.setAppliedAt(LocalDateTime.now());

        JobApplication savedApplication = applicationRepository.save(application);

        return ResponseEntity.ok(Map.of(
                "message", "Job applied successfully",
                "application", savedApplication
        ));
    }

    @GetMapping
    public List<JobApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<JobApplication> getApplicationsByUser(@PathVariable Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return applicationRepository.findById(id).map(application -> {
            application.setStatus(status);
            applicationRepository.save(application);
            return ResponseEntity.ok(Map.of("message", "Application status updated"));
        }).orElse(ResponseEntity.notFound().build());
    }
}