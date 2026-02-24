package com.steelmanagement.steel_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "Constructions")
@Data
public class Construction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "construction_code", unique = true)
    private String constructionCode;

    @Column(name = "customer_id")
    private Integer customerId;

    @ManyToOne
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    @Column(name = "construction_name")
    private String constructionName;

    @Column(name = "description")
    private String description;

    @Column(name = "construction_status")
    private String constructionStatus;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "notes")
    private String notes;

    @Column(name = "promotion_id")
    private Integer promotionId;

    @Column(name = "promotion_code")
    private String promotionCode;

    @Column(name = "promotion_discount_amount")
    private Double promotionDiscountAmount;

    @Column(name = "created_by")  // Thêm trường này
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}