package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.Construction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConstructionRepository extends JpaRepository<Construction, Integer> {

    List<Construction> findByCustomerId(Integer customerId);

    List<Construction> findByConstructionStatus(String status);

    List<Construction> findByCreatedBy(Integer staffId);  // Thêm method này

    @Query(value = "SELECT * FROM vw_SubmittedConstructions", nativeQuery = true)
    List<Object[]> findSubmittedConstructions();
}