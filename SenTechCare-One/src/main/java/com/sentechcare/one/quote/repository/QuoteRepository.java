package com.sentechcare.one.quote.repository;

import com.sentechcare.one.common.enums.QuoteStatus;
import com.sentechcare.one.quote.entity.Quote;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long>, JpaSpecificationExecutor<Quote> {

    Optional<Quote> findByReferenceIgnoreCase(String reference);

    boolean existsByReferenceIgnoreCase(String reference);

    boolean existsByReferenceIgnoreCaseAndIdNot(String reference, Long id);

    Page<Quote> findByClientId(Long clientId, Pageable pageable);

    Page<Quote> findByStatus(QuoteStatus status, Pageable pageable);
}
