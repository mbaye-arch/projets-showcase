package com.sentechcare.one.intervention.dto;

import com.sentechcare.one.common.enums.InterventionStatus;
import com.sentechcare.one.common.enums.InterventionType;
import com.sentechcare.one.common.enums.PriorityLevel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterventionResponseDto {

    private Long id;
    private Long clientId;
    private Long assignedTechnicianId;
    private String assignedTechnicianFirstName;
    private String assignedTechnicianLastName;
    private InterventionType type;
    private LocalDateTime plannedDate;
    private LocalDateTime actualDate;
    private InterventionStatus status;
    private PriorityLevel priority;
    private String problemDescription;
    private String diagnosis;
    private String solutionProvided;
    private Integer durationMinutes;
    private BigDecimal cost;
    private String closingNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
