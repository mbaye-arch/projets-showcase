package com.sentechcare.one.ticket.repository;

import com.sentechcare.one.common.enums.PriorityLevel;
import com.sentechcare.one.common.enums.TicketChannel;
import com.sentechcare.one.common.enums.TicketStatus;
import com.sentechcare.one.ticket.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    Page<Ticket> findByClientId(Long clientId, Pageable pageable);

    Page<Ticket> findByAssignedTechnicianId(Long assignedTechnicianId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Page<Ticket> findByPriority(PriorityLevel priority, Pageable pageable);

    Page<Ticket> findByChannel(TicketChannel channel, Pageable pageable);
}
