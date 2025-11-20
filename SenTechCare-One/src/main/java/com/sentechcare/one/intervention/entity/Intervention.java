package com.sentechcare.one.intervention.entity;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.common.entity.BaseAuditEntity;
import com.sentechcare.one.common.enums.InterventionStatus;
import com.sentechcare.one.common.enums.InterventionType;
import com.sentechcare.one.common.enums.PriorityLevel;
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
import java.math.BigDecimal;
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
    name = "interventions",
    indexes = {
        @Index(name = "idx_interventions_client_id", columnList = "client_id"),
        @Index(name = "idx_interventions_assigned_technician_id", columnList = "assigned_technician_id"),
        @Index(name = "idx_interventions_status", columnList = "status"),
        @Index(name = "idx_interventions_priority", columnList = "priority"),
        @Index(name = "idx_interventions_planned_date", columnList = "planned_date"),
        @Index(name = "idx_interventions_actual_date", columnList = "actual_date"),
        @Index(name = "idx_interventions_created_at", columnList = "created_at")
    }
)
public class Intervention extends BaseAuditEntity {

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
    @Column(name = "type", nullable = false, length = 30)
    private InterventionType type;

    @Column(name = "planned_date", columnDefinition = "DATETIME(3)")
    private LocalDateTime plannedDate;

    @Column(name = "actual_date", columnDefinition = "DATETIME(3)")
    private LocalDateTime actualDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private InterventionStatus status = InterventionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "priority", nullable = false, length = 20)
    private PriorityLevel priority = PriorityLevel.NORMAL;

    @Column(name = "problem_description", nullable = false, columnDefinition = "TEXT")
    private String problemDescription;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "solution_provided", columnDefinition = "TEXT")
    private String solutionProvided;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Builder.Default
    @Column(name = "cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(name = "closing_notes", columnDefinition = "TEXT")
    private String closingNotes;
}
