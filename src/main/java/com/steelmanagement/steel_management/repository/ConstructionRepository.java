package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.Construction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConstructionRepository extends JpaRepository<Construction, Integer> {

    // ========== Customer methods ==========
    List<Construction> findByCustomerId(Integer customerId);
    List<Construction> findByCustomerIdOrderByCreatedAtDesc(Integer customerId);
    List<Construction> findByCustomerIdAndConstructionStatus(Integer customerId, String status);

    Long countByCustomerId(Integer customerId);
    Long countByCustomerIdAndConstructionStatus(Integer customerId, String status);

    @Query("SELECT c FROM Construction c WHERE c.customerId = :customerId AND " +
            "(LOWER(c.constructionName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.constructionCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Construction> searchByCustomerId(@Param("customerId") Integer customerId, @Param("keyword") String keyword);

    // ========== Staff methods ==========
    List<Construction> findByCreatedBy(Integer staffId);
    List<Construction> findByConstructionStatus(String status);
    List<Construction> findByCreatedByOrderByCreatedAtDesc(Integer staffId);

    @Query("SELECT c FROM Construction c WHERE c.createdBy = :staffId AND " +
            "(LOWER(c.constructionName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.constructionCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Construction> searchByStaffId(@Param("staffId") Integer staffId, @Param("keyword") String keyword);

}