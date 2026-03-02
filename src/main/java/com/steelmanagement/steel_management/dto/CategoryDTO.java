package com.steelmanagement.steel_management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CategoryDTO {
    private Integer id;
    private String name;
    private String code;
    private Integer parentId;
    private String parentName;
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer productCount;
}