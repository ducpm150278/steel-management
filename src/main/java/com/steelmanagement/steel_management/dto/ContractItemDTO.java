package com.steelmanagement.steel_management.dto;

import lombok.Data;

@Data
public class ContractItemDTO {
    private Integer productId;
    private String productName;
    private String productCode;
    private Double quantity;
    private String unit;
    private Double price;
    private Double total;

    // Có thể thêm thông tin từ ProductDTO nếu cần
    private ProductDTO productDetails;
}