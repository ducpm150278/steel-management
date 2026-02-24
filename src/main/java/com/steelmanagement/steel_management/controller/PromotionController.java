package com.steelmanagement.steel_management.controller;

import com.steelmanagement.steel_management.dto.ApiResponse;
import com.steelmanagement.steel_management.dto.PromotionDTO;
import com.steelmanagement.steel_management.entity.Promotion;
import com.steelmanagement.steel_management.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/promotions")
@CrossOrigin(origins = "http://localhost:3000")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    /**
     * Lấy tất cả promotions
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionDTO>>> getAllPromotions() {
        try {
            List<PromotionDTO> promotions = promotionService.getAllPromotions();
            return ResponseEntity.ok(ApiResponse.success(promotions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Tìm kiếm promotions theo keyword
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PromotionDTO>>> searchPromotions(
            @RequestParam(required = false) String keyword) {
        try {
            List<PromotionDTO> promotions = promotionService.searchPromotions(keyword);
            return ResponseEntity.ok(ApiResponse.success(promotions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách promotions đang active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PromotionDTO>>> getActivePromotions() {
        try {
            List<PromotionDTO> promotions = promotionService.getActivePromotions();
            return ResponseEntity.ok(ApiResponse.success(promotions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Lấy promotion theo code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<PromotionDTO>> getPromotionByCode(@PathVariable String code) {
        try {
            PromotionDTO promotion = promotionService.getPromotionByCode(code);
            if (promotion != null) {
                return ResponseEntity.ok(ApiResponse.success(promotion));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Lấy promotion theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionDTO>> getPromotionById(@PathVariable Integer id) {
        try {
            PromotionDTO promotion = promotionService.getPromotionById(id);
            if (promotion != null) {
                return ResponseEntity.ok(ApiResponse.success(promotion));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Tạo promotion mới
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PromotionDTO>> createPromotion(@RequestBody Promotion promotion) {
        try {
            // Set người tạo mặc định là 1 (admin)
            // Trong thực tế, lấy từ session/security context
            promotion.setCreatedBy(1);

            PromotionDTO createdPromotion = promotionService.createPromotion(promotion);
            return ResponseEntity.ok(ApiResponse.success("Thêm khuyến mãi thành công", createdPromotion));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cập nhật promotion
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionDTO>> updatePromotion(
            @PathVariable Integer id,
            @RequestBody Promotion promotion) {
        try {
            // Lấy promotion cũ để giữ lại CreatedBy
            PromotionDTO existingPromotion = promotionService.getPromotionById(id);
            if (existingPromotion == null) {
                return ResponseEntity.notFound().build();
            }

            // Giữ nguyên CreatedBy từ promotion cũ
            promotion.setCreatedBy(existingPromotion.getCreatedBy());

            PromotionDTO updatedPromotion = promotionService.updatePromotion(id, promotion);
            if (updatedPromotion != null) {
                return ResponseEntity.ok(ApiResponse.success("Cập nhật khuyến mãi thành công", updatedPromotion));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Xóa promotion
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Integer id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa khuyến mãi thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cập nhật các promotions hết hạn
     */
    @PostMapping("/update-expired")
    public ResponseEntity<ApiResponse<Integer>> updateExpiredPromotions() {
        try {
            int count = promotionService.updateExpiredPromotions();
            return ResponseEntity.ok(ApiResponse.success("Đã cập nhật " + count + " khuyến mãi hết hạn", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy thống kê promotions
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<PromotionService.PromotionStats>> getPromotionStats() {
        try {
            PromotionService.PromotionStats stats = promotionService.getPromotionStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Kiểm tra promotion còn hiệu lực không
     */
    @GetMapping("/validate/{code}")
    public ResponseEntity<ApiResponse<Boolean>> validatePromotion(@PathVariable String code) {
        try {
            boolean isValid = promotionService.isValidPromotion(code);
            return ResponseEntity.ok(ApiResponse.success(isValid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Tính số tiền giảm giá
     */
    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<Double>> calculateDiscount(
            @RequestParam String code,
            @RequestParam Double orderValue) {
        try {
            Double discount = promotionService.calculateDiscount(code, orderValue);
            return ResponseEntity.ok(ApiResponse.success(discount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Tăng số lần sử dụng promotion
     */
    @PostMapping("/increment/{id}")
    public ResponseEntity<ApiResponse<PromotionDTO>> incrementUsage(@PathVariable Integer id) {
        try {
            PromotionDTO promotion = promotionService.incrementUsage(id);
            if (promotion != null) {
                return ResponseEntity.ok(ApiResponse.success("Tăng số lần sử dụng thành công", promotion));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy promotions theo trạng thái
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<PromotionDTO>>> getPromotionsByStatus(@PathVariable String status) {
        try {
            List<PromotionDTO> promotions = promotionService.getPromotionsByStatus(status);
            return ResponseEntity.ok(ApiResponse.success(promotions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}