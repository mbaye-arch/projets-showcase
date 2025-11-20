package com.sentechcare.one.ticket.entity;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.common.entity.BaseAuditEntity;
import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.common.enums.TicketChannel;
import com.sentechcare.one.common.enums.TicketStatus;
import com.sentechcare.one.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(
    name = "tickets",
    indexes = {
        @Index(name = "idx_tickets_client_id", columnList = "client_id"),
        @Index(name = "idx_tickets_assigned_technician_id", columnList = "assigned_technician_id"),
        @Index(name = "idx_tickets_status", columnList = "status"),
        @Index(name = "idx_tickets_priority", columnList = "priority"),
        @Index(name = "idx_tickets_channel", columnList = "channel"),
        @Index(name = "idx_tickets_created_at", columnList = "created_at"),
        @Index(name = "idx_tickets_resolved_at", columnList = "resolved_at")
    }
)
public class Ticket extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private TicketChannel channel;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "priority", nullable = false, length = 20)
    private PriorityLevel priority = PriorityLevel.NORMAL;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private TicketStatus status = TicketStatus.OPEN;

    @Column(name = "resolved_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime resolvedAt;

    @Column(name = "resolution_comment", columnDefinition = "TEXT")
    private String resolutionComment;
}
