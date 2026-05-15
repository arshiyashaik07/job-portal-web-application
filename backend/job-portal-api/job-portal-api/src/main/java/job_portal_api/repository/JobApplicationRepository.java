package job_portal_api.repository;

import job_portal_api.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserId(Long userId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
}