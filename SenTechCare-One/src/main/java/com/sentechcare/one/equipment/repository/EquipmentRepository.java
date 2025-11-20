package com.sentechcare.one.equipment.repository;

import com.sentechcare.one.common.enums.EquipmentCategory;
import com.sentechcare.one.common.enums.EquipmentStatus;
import com.sentechcare.one.equipment.entity.Equipment;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long>, JpaSpecificationExecutor<Equipment> {

    Page<Equipment> findByClientId(Long clientId, Pageable pageable);

    Page<Equipment> findByStatus(EquipmentStatus status, Pageable pageable);

    Page<Equipment> findByCategory(EquipmentCategory category, Pageable pageable);

    Page<Equipment> findByClientIdAndStatus(Long clientId, EquipmentStatus status, Pageable pageable);

    Page<Equipment> findBySerialNumberContainingIgnoreCase(String serialNumber, Pageable pageable);

    Optional<Equipment> findFirstBySerialNumberIgnoreCase(String serialNumber);
}
