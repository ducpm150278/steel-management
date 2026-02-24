package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.DashboardStats;
import com.steelmanagement.steel_management.repository.ConstructionRepository;
import com.steelmanagement.steel_management.repository.CustomerRepository;
import com.steelmanagement.steel_management.repository.ProductRepository;
import com.steelmanagement.steel_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ConstructionRepository constructionRepository;

    public DashboardStats getStats() {
        // Lấy dữ liệu từ database
        Long totalUsers = userRepository.count();
        Long totalCustomers = customerRepository.count();
        Long totalProducts = productRepository.count();

        // Lấy số lượng sản phẩm sắp hết hàng
        Integer lowStockProducts = productRepository.findLowStockProducts().size();

        // Lấy số lượng công trình đang chờ
        Integer pendingConstructions = constructionRepository.findByConstructionStatus("Submitted").size();

        return new DashboardStats(
                totalUsers,
                totalCustomers,
                totalProducts,
                lowStockProducts,
                pendingConstructions
        );
    }
}