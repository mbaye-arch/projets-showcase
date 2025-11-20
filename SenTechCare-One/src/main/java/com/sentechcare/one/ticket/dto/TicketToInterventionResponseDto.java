package com.sentechcare.one.ticket.dto;

import com.sentechcare.one.common.enums.InterventionStatus;
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
public class TicketToInterventionResponseDto {

    private Long ticketId;
    private TicketStatus ticketStatus;
    private Long interventionId;
    private InterventionStatus interventionStatus;
    private LocalDateTime convertedAt;
    private String message;
}
