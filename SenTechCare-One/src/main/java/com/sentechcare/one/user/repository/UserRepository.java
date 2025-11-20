package com.sentechcare.one.user.repository;

import com.sentechcare.one.user.entity.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    Page<User> findByActiveTrue(Pageable pageable);

    Page<User> findByRole_Id(Long roleId, Pageable pageable);

    Page<User> findByRole_Name(String roleName, Pageable pageable);

    Page<User> findByRole_NameAndActiveTrue(String roleName, Pageable pageable);
}
