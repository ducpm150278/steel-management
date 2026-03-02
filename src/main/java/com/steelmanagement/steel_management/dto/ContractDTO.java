package com.steelmanagement.steel_management.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContractDTO {
    private Integer id;
    private String contractNumber;
    private String constructionName;
    private String customerName;
    private String customerPhone;
    private String staffName;
    private String staffRole;
    private LocalDateTime createdDate;
    private String status;
    private Double totalAmount;
    private String promotionCode;
    private Double promotionDiscount;
    private Double finalAmount;
    private List<ContractItemDTO> items;  // Đổi tên cho rõ ràng
    private String notes;
    private String rejectReason;
}