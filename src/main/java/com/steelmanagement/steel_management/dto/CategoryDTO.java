package com.steelmanagement.steel_management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CategoryDTO {
    private Integer id;
    private String name;
    private String code;
    private Integer parentId;
    private String parentName;      // Tên danh mục cha (cho hiển thị)
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Thống kê
    private long productCount;      // Số lượng sản phẩm trong danh mục
    private int childCount;          // Số lượng danh mục con

    // Đường dẫn đầy đủ (ví dụ: Thép > Thép H > Thép H 100)
    private String fullPath;
}