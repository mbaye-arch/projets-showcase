package com.sentechcare.one.intervention.dto;

import com.sentechcare.one.common.enums.InterventionStatus;
import com.sentechcare.one.common.enums.InterventionType;
import com.sentechcare.one.common.enums.PriorityLevel;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class InterventionRequestDto {

    @NotNull(message = "clientId is required")
    private Long clientId;

    private Long assignedTechnicianId;

    @NotNull(message = "type is required")
    private InterventionType type;

    private LocalDateTime plannedDate;

    private LocalDateTime actualDate;

    private InterventionStatus status;

    private PriorityLevel priority;

    @NotBlank(message = "problemDescription is required")
    private String problemDescription;

    private String diagnosis;

    private String solutionProvided;

    @Positive(message = "durationMinutes must be greater than 0")
    private Integer durationMinutes;

    @DecimalMin(value = "0.0", inclusive = true, message = "cost must be greater than or equal to 0")
    private BigDecimal cost;

    private String closingNotes;
}
