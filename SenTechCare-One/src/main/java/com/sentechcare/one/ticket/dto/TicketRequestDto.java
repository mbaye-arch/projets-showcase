package com.sentechcare.one.ticket.dto;

import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.common.enums.TicketChannel;
import com.sentechcare.one.common.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class TicketRequestDto {

    @NotNull(message = "clientId is required")
    private Long clientId;

    private Long assignedTechnicianId;

    @NotNull(message = "channel is required")
    private TicketChannel channel;

    @NotBlank(message = "subject is required")
    @Size(max = 255, message = "subject must not exceed 255 characters")
    private String subject;

    @NotBlank(message = "description is required")
    private String description;

    private PriorityLevel priority;

    private TicketStatus status;

    private LocalDateTime resolvedAt;

    private String resolutionComment;
}
