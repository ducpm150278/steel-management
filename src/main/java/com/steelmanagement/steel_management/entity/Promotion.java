package com.steelmanagement.steel_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "Promotions")
@Data
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PromotionID")
    private Integer promotionId;

    @Column(name = "Code", nullable = false, unique = true)
    private String code;

    @Column(name = "Description")
    private String description;

    @Column(name = "DiscountType", nullable = false)
    private String discountType;

    @Column(name = "DiscountPercentage")
    private Double discountPercentage;

    @Column(name = "DiscountValue")
    private Double discountValue;

    @Column(name = "MaxUsage")
    private Integer maxUsage;

    @Column(name = "UsageCount")
    private Integer usageCount = 0;

    @Column(name = "StartDate", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "EndDate", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "Status")
    private String status = "active";

    @Column(name = "CreatedBy", nullable = false)
    private Integer createdBy;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (usageCount == null) usageCount = 0;
        if (status == null) status = "active";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}