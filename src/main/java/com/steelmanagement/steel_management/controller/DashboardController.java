package com.steelmanagement.steel_management.controller;

import com.steelmanagement.steel_management.dto.ApiResponse;
import com.steelmanagement.steel_management.dto.DashboardStats;
import com.steelmanagement.steel_management.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")  // Thêm RequestMapping
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")  // URL sẽ là /api/dashboard/stats
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        try {
            DashboardStats stats = dashboardService.getStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy dữ liệu thống kê: " + e.getMessage()));
        }
    }

    // Thêm các API khác nếu cần
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Double>> getMonthlyRevenue() {
        // Code xử lý
        return ResponseEntity.ok(ApiResponse.success(1000000.0));
    }
}