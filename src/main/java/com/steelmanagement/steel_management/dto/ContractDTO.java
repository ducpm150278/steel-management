package com.steelmanagement.steel_management.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContractDTO {
    private Integer id;
    private String contractNumber;
    private Integer constructionId;
    private String constructionName;
    private Integer customerId;
    private String customerName;
    private String customerPhone;
    private LocalDate contractDate;
    private LocalDate deliveryDate;
    private String contractStatus;
    private String paymentStatus;
    private String paymentMethod;
    private Double totalAmount;
    private Double vatAmount;
    private Double finalAmount;
    private Double depositAmount;
    private String paymentTerms;
    private String deliveryTerms;
    private String technicalRequirements;
    private Integer promotionId;
    private String promotionCode;
    private Double promotionDiscountAmount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer createdBy;
    private String createdByName;
    private Integer approvedBy;
    private List<ContractItemDTO> items;
}