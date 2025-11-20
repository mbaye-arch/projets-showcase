package com.sentechcare.one.ticket.dto;

import com.sentechcare.one.common.enums.InterventionType;
import jakarta.validation.constraints.NotNull;
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
public class TicketToInterventionRequestDto {

    @NotNull(message = "interventionType is required")
    private InterventionType interventionType;

    private Long assignedTechnicianId;

    private LocalDateTime plannedDate;

    @Builder.Default
    private Boolean closeTicket = Boolean.FALSE;

    private String resolutionComment;
}
