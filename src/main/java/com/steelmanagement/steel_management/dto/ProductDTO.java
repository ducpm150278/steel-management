package com.steelmanagement.steel_management.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductDTO {
    private Integer id;
    private String productCode;
    private Integer categoryId;
    private String categoryName;
    private String name;
    private String description;
    private String specifications;
    private String unit;
    private Double lengthPerUnit;
    private Double weightPerUnit;
    private String images;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("stockQuantity")
    private Double stockQuantity;

    @JsonProperty("minStockLevel")
    private Double minStockLevel;

    // Thêm trường price từ PriceLists
    private Double price;
}