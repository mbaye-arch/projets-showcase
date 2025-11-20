package com.sentechcare.one.intervention.repository;

import com.sentechcare.one.common.enums.InterventionStatus;
import com.sentechcare.one.common.enums.InterventionType;
import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.intervention.entity.Intervention;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long>, JpaSpecificationExecutor<Intervention> {

    Page<Intervention> findByClientId(Long clientId, Pageable pageable);

    Page<Intervention> findByAssignedTechnicianId(Long assignedTechnicianId, Pageable pageable);

    Page<Intervention> findByStatus(InterventionStatus status, Pageable pageable);

    Page<Intervention> findByPriority(PriorityLevel priority, Pageable pageable);

    Page<Intervention> findByType(InterventionType type, Pageable pageable);
}
