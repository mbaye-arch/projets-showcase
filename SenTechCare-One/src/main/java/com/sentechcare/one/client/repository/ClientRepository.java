package com.sentechcare.one.client.repository;

import com.sentechcare.one.client.entity.Client;
import com.sentechcare.one.common.enums.ClientType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {

    Page<Client> findByActiveTrue(Pageable pageable);

    Page<Client> findByClientType(ClientType clientType, Pageable pageable);

    Optional<Client> findByEmailIgnoreCase(String email);
}
