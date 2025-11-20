package com.sentechcare.one.ticket.dto;

import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.common.enums.TicketChannel;
import com.sentechcare.one.common.enums.TicketStatus;
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
public class TicketResponseDto {

    private Long id;
    private Long clientId;
    private Long assignedTechnicianId;
    private String assignedTechnicianFirstName;
    private String assignedTechnicianLastName;
    private TicketChannel channel;
    private String subject;
    private String description;
    private PriorityLevel priority;
    private TicketStatus status;
    private LocalDateTime resolvedAt;
    private String resolutionComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
