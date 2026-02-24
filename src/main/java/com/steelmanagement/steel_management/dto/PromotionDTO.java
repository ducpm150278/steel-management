package com.steelmanagement.steel_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.steelmanagement.steel_management.entity.Promotion;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {
    private Integer promotionId;
    private String code;
    private String description;
    private String discountType;
    private Double discountPercentage;
    private Double discountValue;
    private Integer maxUsage;
    private Integer usageCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Display fields
    private String discountDisplay;
    private String dateRangeDisplay;
    private Integer remainingUsage;
    private boolean isActive;

    public static PromotionDTO fromEntity(Promotion promotion) {
        PromotionDTO dto = new PromotionDTO();
        dto.setPromotionId(promotion.getPromotionId());
        dto.setCode(promotion.getCode());
        dto.setDescription(promotion.getDescription());
        dto.setDiscountType(promotion.getDiscountType());
        dto.setDiscountPercentage(promotion.getDiscountPercentage());
        dto.setDiscountValue(promotion.getDiscountValue());
        dto.setMaxUsage(promotion.getMaxUsage());
        dto.setUsageCount(promotion.getUsageCount());
        dto.setStartDate(promotion.getStartDate());
        dto.setEndDate(promotion.getEndDate());
        dto.setStatus(promotion.getStatus());
        dto.setCreatedBy(promotion.getCreatedBy());
        dto.setCreatedAt(promotion.getCreatedAt());
        dto.setUpdatedAt(promotion.getUpdatedAt());

        // Tính toán các giá trị hiển thị
        if ("percentage".equals(promotion.getDiscountType())) {
            dto.setDiscountDisplay(promotion.getDiscountPercentage() + "%");
        } else {
            dto.setDiscountDisplay(String.format("%,.0fđ", promotion.getDiscountValue()));
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        dto.setDateRangeDisplay(
                promotion.getStartDate().format(formatter) + " - " +
                        promotion.getEndDate().format(formatter)
        );

        if (promotion.getMaxUsage() != null) {
            dto.setRemainingUsage(promotion.getMaxUsage() - promotion.getUsageCount());
        }

        LocalDateTime now = LocalDateTime.now();
        dto.setActive(
                "active".equals(promotion.getStatus()) &&
                        promotion.getStartDate().isBefore(now) &&
                        promotion.getEndDate().isAfter(now)
        );

        return dto;
    }
}