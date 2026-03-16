package com.steelmanagement.steel_management.dto;

import lombok.Data;

@Data
public class ContractItemDTO {
    private Integer id;
    private Integer productId;
    private String productName;
    private String productCode;
    private Double quantity;
    private String unit;
    private Double length;
    private Double unitPrice;
    private Double discountPercent;
    private Double totalPrice;
    private String notes;
    private Integer constructionDetailId;
}