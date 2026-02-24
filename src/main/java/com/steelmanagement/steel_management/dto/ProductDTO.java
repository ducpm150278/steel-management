package com.steelmanagement.steel_management.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.steelmanagement.steel_management.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @JsonProperty("stockQuantity")
    private Double stockQuantity;

    @JsonProperty("minStockLevel")
    private Double minStockLevel;

    public static ProductDTO fromEntity(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setProductCode(product.getProductCode());
        dto.setCategoryId(product.getCategoryId());
        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setSpecifications(product.getSpecifications());
        dto.setUnit(product.getUnit());
        dto.setLengthPerUnit(product.getLengthPerUnit());
        dto.setWeightPerUnit(product.getWeightPerUnit());
        dto.setImages(product.getImages());
        dto.setIsActive(product.getIsActive());
        return dto;
    }
}