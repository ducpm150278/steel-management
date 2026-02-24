package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.PromotionDTO;
import com.steelmanagement.steel_management.entity.Promotion;
import com.steelmanagement.steel_management.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    /**
     * Lấy tất cả promotions
     */
    public List<PromotionDTO> getAllPromotions() {
        List<Promotion> promotions = promotionRepository.findAll();
        System.out.println("Found " + promotions.size() + " promotions in database");
        return promotions.stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Tìm kiếm promotions theo từ khóa
     */
    public List<PromotionDTO> searchPromotions(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllPromotions();
        }
        List<Promotion> promotions = promotionRepository.searchPromotions(keyword);
        System.out.println("Found " + promotions.size() + " promotions matching keyword: " + keyword);
        return promotions.stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy promotion theo ID
     */
    public PromotionDTO getPromotionById(Integer id) {
        return promotionRepository.findById(id)
                .map(promotion -> {
                    System.out.println("Found promotion with ID: " + id);
                    return PromotionDTO.fromEntity(promotion);
                })
                .orElse(null);
    }

    /**
     * Lấy promotion theo Code
     */
    public PromotionDTO getPromotionByCode(String code) {
        return promotionRepository.findByCode(code)
                .map(promotion -> {
                    System.out.println("Found promotion with code: " + code);
                    return PromotionDTO.fromEntity(promotion);
                })
                .orElse(null);
    }

    /**
     * Lấy danh sách promotions đang active
     */
    public List<PromotionDTO> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> promotions = promotionRepository.findActivePromotions(now);
        System.out.println("Found " + promotions.size() + " active promotions");
        return promotions.stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách promotions theo trạng thái
     */
    public List<PromotionDTO> getPromotionsByStatus(String status) {
        List<Promotion> promotions = promotionRepository.findByStatus(status);
        System.out.println("Found " + promotions.size() + " promotions with status: " + status);
        return promotions.stream()
                .map(PromotionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Tạo promotion mới
     */
    public PromotionDTO createPromotion(Promotion promotion) {
        // Kiểm tra code đã tồn tại chưa
        if (promotionRepository.findByCode(promotion.getCode()).isPresent()) {
            throw new RuntimeException("Mã khuyến mãi '" + promotion.getCode() + "' đã tồn tại!");
        }

        // Validate dữ liệu
        validatePromotion(promotion);

        // Set các giá trị mặc định
        promotion.setUsageCount(0);
        promotion.setCreatedAt(LocalDateTime.now());
        promotion.setUpdatedAt(LocalDateTime.now());
        if (promotion.getStatus() == null) {
            promotion.setStatus("active");
        }

        // Kiểm tra ngày
        LocalDateTime now = LocalDateTime.now();
        if (promotion.getStartDate() == null) {
            promotion.setStartDate(now);
        }
        if (promotion.getEndDate() == null) {
            promotion.setEndDate(now.plusDays(30));
        }

        Promotion savedPromotion = promotionRepository.save(promotion);
        System.out.println("Created new promotion with ID: " + savedPromotion.getPromotionId());
        return PromotionDTO.fromEntity(savedPromotion);
    }

    /**
     * Cập nhật promotion
     */
    public PromotionDTO updatePromotion(Integer id, Promotion promotionDetails) {
        return promotionRepository.findById(id)
                .map(promotion -> {
                    // Kiểm tra code nếu thay đổi
                    if (!promotion.getCode().equals(promotionDetails.getCode()) &&
                            promotionRepository.findByCode(promotionDetails.getCode()).isPresent()) {
                        throw new RuntimeException("Mã khuyến mãi '" + promotionDetails.getCode() + "' đã tồn tại!");
                    }

                    // Validate dữ liệu
                    validatePromotion(promotionDetails);

                    // Cập nhật thông tin
                    promotion.setCode(promotionDetails.getCode());
                    promotion.setDescription(promotionDetails.getDescription());
                    promotion.setDiscountType(promotionDetails.getDiscountType());
                    promotion.setDiscountPercentage(promotionDetails.getDiscountPercentage());
                    promotion.setDiscountValue(promotionDetails.getDiscountValue());
                    promotion.setMaxUsage(promotionDetails.getMaxUsage());
                    promotion.setStartDate(promotionDetails.getStartDate());
                    promotion.setEndDate(promotionDetails.getEndDate());
                    promotion.setStatus(promotionDetails.getStatus());
                    promotion.setUpdatedAt(LocalDateTime.now());

                    Promotion updatedPromotion = promotionRepository.save(promotion);
                    System.out.println("Updated promotion with ID: " + id);
                    return PromotionDTO.fromEntity(updatedPromotion);
                })
                .orElse(null);
    }

    /**
     * Xóa promotion
     */
    public void deletePromotion(Integer id) {
        if (promotionRepository.existsById(id)) {
            promotionRepository.deleteById(id);
            System.out.println("Deleted promotion with ID: " + id);
        } else {
            throw new RuntimeException("Không tìm thấy khuyến mãi với ID: " + id);
        }
    }

    /**
     * Cập nhật trạng thái expired cho các promotion hết hạn
     */
    @Transactional
    public int updateExpiredPromotions() {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> expiredPromotions = promotionRepository.findExpiredPromotions(now);

        if (!expiredPromotions.isEmpty()) {
            for (Promotion p : expiredPromotions) {
                p.setStatus("expired");
                p.setUpdatedAt(now);
            }
            promotionRepository.saveAll(expiredPromotions);
            System.out.println("Updated " + expiredPromotions.size() + " expired promotions");
        }

        return expiredPromotions.size();
    }

    /**
     * Tăng UsageCount khi promotion được sử dụng
     */
    public PromotionDTO incrementUsage(Integer id) {
        return promotionRepository.findById(id)
                .map(promotion -> {
                    // Kiểm tra nếu đã đạt giới hạn sử dụng
                    if (promotion.getMaxUsage() != null &&
                            promotion.getUsageCount() >= promotion.getMaxUsage()) {
                        throw new RuntimeException("Khuyến mãi đã hết lượt sử dụng!");
                    }

                    promotion.setUsageCount(promotion.getUsageCount() + 1);
                    promotion.setUpdatedAt(LocalDateTime.now());

                    // Nếu đã đạt giới hạn, tự động chuyển sang inactive
                    if (promotion.getMaxUsage() != null &&
                            promotion.getUsageCount() >= promotion.getMaxUsage()) {
                        promotion.setStatus("inactive");
                    }

                    Promotion updatedPromotion = promotionRepository.save(promotion);
                    System.out.println("Incremented usage for promotion ID: " + id +
                            ", new count: " + updatedPromotion.getUsageCount());
                    return PromotionDTO.fromEntity(updatedPromotion);
                })
                .orElse(null);
    }

    /**
     * Kiểm tra promotion còn hiệu lực không
     */
    public boolean isValidPromotion(String code) {
        return promotionRepository.findByCode(code)
                .map(promotion -> {
                    LocalDateTime now = LocalDateTime.now();
                    return "active".equals(promotion.getStatus()) &&
                            promotion.getStartDate().isBefore(now) &&
                            promotion.getEndDate().isAfter(now) &&
                            (promotion.getMaxUsage() == null ||
                                    promotion.getUsageCount() < promotion.getMaxUsage());
                })
                .orElse(false);
    }

    /**
     * Tính số tiền giảm giá
     */
    public Double calculateDiscount(String code, Double orderValue) {
        return promotionRepository.findByCode(code)
                .map(promotion -> {
                    if (!isValidPromotion(code)) {
                        throw new RuntimeException("Khuyến mãi không hợp lệ hoặc đã hết hạn!");
                    }

                    Double discount = 0.0;

                    if ("percentage".equals(promotion.getDiscountType())) {
                        discount = orderValue * promotion.getDiscountPercentage() / 100;
                        // Không giới hạn số tiền giảm tối đa
                    } else { // fixed
                        discount = promotion.getDiscountValue();
                        // Không vượt quá giá trị đơn hàng
                        if (discount > orderValue) {
                            discount = orderValue;
                        }
                    }

                    return discount;
                })
                .orElse(0.0);
    }

    /**
     * Validate dữ liệu promotion
     */
    private void validatePromotion(Promotion promotion) {
        // Kiểm tra code
        if (promotion.getCode() == null || promotion.getCode().trim().isEmpty()) {
            throw new RuntimeException("Mã khuyến mãi không được để trống!");
        }

        // Kiểm tra loại giảm giá
        if (promotion.getDiscountType() == null) {
            throw new RuntimeException("Loại giảm giá không được để trống!");
        }

        // Kiểm tra giá trị giảm giá theo loại
        if ("percentage".equals(promotion.getDiscountType())) {
            if (promotion.getDiscountPercentage() == null) {
                throw new RuntimeException("Phần trăm giảm giá không được để trống!");
            }
            if (promotion.getDiscountPercentage() <= 0 || promotion.getDiscountPercentage() > 100) {
                throw new RuntimeException("Phần trăm giảm giá phải từ 1-100!");
            }
        } else if ("fixed".equals(promotion.getDiscountType())) {
            if (promotion.getDiscountValue() == null) {
                throw new RuntimeException("Số tiền giảm giá không được để trống!");
            }
            if (promotion.getDiscountValue() <= 0) {
                throw new RuntimeException("Số tiền giảm giá phải lớn hơn 0!");
            }
        } else {
            throw new RuntimeException("Loại giảm giá không hợp lệ! Chỉ chấp nhận 'percentage' hoặc 'fixed'");
        }

        // Kiểm tra ngày
        if (promotion.getStartDate() != null && promotion.getEndDate() != null) {
            if (promotion.getStartDate().isAfter(promotion.getEndDate())) {
                throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu!");
            }
        }

        // Kiểm tra MaxUsage
        if (promotion.getMaxUsage() != null && promotion.getMaxUsage() < 0) {
            throw new RuntimeException("Số lần sử dụng tối đa không được âm!");
        }

        // Kiểm tra CreatedBy
        if (promotion.getCreatedBy() == null) {
            throw new RuntimeException("Người tạo không được để trống!");
        }
    }

    /**
     * Thống kê promotions
     */
    public PromotionStats getPromotionStats() {
        List<Promotion> allPromotions = promotionRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysFromNow = now.plusDays(3);

        long total = allPromotions.size();
        long active = allPromotions.stream()
                .filter(p -> "active".equals(p.getStatus()) &&
                        p.getStartDate().isBefore(now) &&
                        p.getEndDate().isAfter(now))
                .count();

        long expired = allPromotions.stream()
                .filter(p -> "expired".equals(p.getStatus()) ||
                        p.getEndDate().isBefore(now))
                .count();

        long expiringSoon = allPromotions.stream()
                .filter(p -> "active".equals(p.getStatus()) &&
                        p.getEndDate().isBefore(threeDaysFromNow) &&
                        p.getEndDate().isAfter(now))
                .count();

        long totalUsage = allPromotions.stream()
                .mapToInt(Promotion::getUsageCount)
                .sum();

        return new PromotionStats(total, active, expired, expiringSoon, totalUsage);
    }

    /**
     * Inner class cho thống kê
     */
    public static class PromotionStats {
        private final long totalPromotions;
        private final long activePromotions;
        private final long expiredPromotions;
        private final long expiringSoon;
        private final long totalUsage;

        public PromotionStats(long totalPromotions, long activePromotions,
                              long expiredPromotions, long expiringSoon, long totalUsage) {
            this.totalPromotions = totalPromotions;
            this.activePromotions = activePromotions;
            this.expiredPromotions = expiredPromotions;
            this.expiringSoon = expiringSoon;
            this.totalUsage = totalUsage;
        }

        // Getters
        public long getTotalPromotions() { return totalPromotions; }
        public long getActivePromotions() { return activePromotions; }
        public long getExpiredPromotions() { return expiredPromotions; }
        public long getExpiringSoon() { return expiringSoon; }
        public long getTotalUsage() { return totalUsage; }
    }
}