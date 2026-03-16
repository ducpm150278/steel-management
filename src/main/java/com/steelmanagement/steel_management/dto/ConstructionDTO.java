package com.steelmanagement.steel_management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConstructionDTO {
    private Integer id;
    private String constructionCode;
    private String constructionName;
    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private String description;
    private String constructionStatus;
    private LocalDateTime submittedAt;
    private String notes;
    private Integer promotionId;
    private String promotionCode;
    private Double promotionDiscountAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer createdBy;
    private String createdByName;
    private Integer itemCount; // Đếm số lượng sản phẩm
}