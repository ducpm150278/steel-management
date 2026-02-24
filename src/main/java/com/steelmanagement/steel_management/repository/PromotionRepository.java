package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {

    Optional<Promotion> findByCode(String code);

    List<Promotion> findByStatus(String status);

    @Query("SELECT p FROM Promotion p WHERE " +
            "LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Promotion> searchPromotions(@Param("keyword") String keyword);

    @Query("SELECT p FROM Promotion p WHERE " +
            "p.status = 'active' AND " +
            "p.startDate <= :currentDate AND " +
            "p.endDate >= :currentDate")
    List<Promotion> findActivePromotions(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT p FROM Promotion p WHERE " +
            "p.endDate < :currentDate AND p.status = 'active'")
    List<Promotion> findExpiredPromotions(@Param("currentDate") LocalDateTime currentDate);
}