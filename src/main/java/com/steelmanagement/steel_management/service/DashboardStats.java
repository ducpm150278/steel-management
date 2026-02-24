package com.steelmanagement.steel_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Long totalUsers;
    private Long totalCustomers;
    private Long totalProducts;
    private Integer lowStockProducts;
    private Integer pendingConstructions;
    private Double monthlyRevenue;
    private Integer monthlyOrders;

    // Thêm constructor nếu cần
    public DashboardStats(Long totalUsers, Long totalCustomers, Long totalProducts,
                          Integer lowStockProducts, Integer pendingConstructions) {
        this.totalUsers = totalUsers;
        this.totalCustomers = totalCustomers;
        this.totalProducts = totalProducts;
        this.lowStockProducts = lowStockProducts;
        this.pendingConstructions = pendingConstructions;
        this.monthlyRevenue = 0.0;
        this.monthlyOrders = 0;
    }
}