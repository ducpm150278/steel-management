package com.steelmanagement.steel_management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    /**
     * Trang chủ - Admin/Owner Dashboard
     */
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    /**
     * =============================================
     * OWNER / ADMIN PAGES - Thêm prefix /page
     * =============================================
     */

    @GetMapping("/page/user-management")
    public String userManagement() {
        return "forward:/user-management.html";
    }

    @GetMapping("/page/promotion-management")
    public String promotionManagement() {
        return "forward:/promotion-management.html";
    }

    @GetMapping("/page/contract-management")
    public String contractManagement() {
        return "forward:/contract-management.html";
    }

    /**
     * =============================================
     * STAFF PAGES - Thêm prefix /page
     * =============================================
     */

    @GetMapping("/page/staff/contract")
    public String staffContract() {
        return "forward:/staff-contract.html";
    }

    @GetMapping("/page/staff/products")
    public String staffProducts() {
        return "forward:/staff-products.html";
    }

    @GetMapping("/page/staff/categories")
    public String staffCategories() {
        return "forward:/staff-categories.html";
    }

    @GetMapping("/page/staff/customers")
    public String staffCustomers() {
        return "forward:/staff-customers.html";
    }

    @GetMapping("/page/staff/constructions")
    public String staffConstructions() {
        return "forward:/staff-constructions.html";
    }

    @GetMapping("/page/staff/dashboard")
    public String staffDashboard() {
        return "forward:/staff-dashboard.html";
    }

    @GetMapping("/page/staff/inventory")
    public String staffInventory() {
        return "forward:/staff-inventory.html";
    }

        @GetMapping("/page/staff/contract-create")
    public String staffStaffCreate() {
        return "forward:/staff-contract-create.html";
    }
    /**
     * =============================================
     * CUSTOMER PAGES - Thêm prefix /page
     * =============================================
     */

    @GetMapping("/page/customer/constructions")
    public String customerConstructions() {
        return "forward:/customer-constructions.html";
    }

    @GetMapping("/page/customer/products")
    public String customerProducts() {
        return "forward:/customer-products.html";
    }

    @GetMapping("/page/customer/contracts")
    public String customerContracts() {
        return "forward:/customer-contracts.html";
    }

    @GetMapping("/page/customer/debts")
    public String customerDebts() {
        return "forward:/customer-debts.html";
    }

    @GetMapping("/page/customer/dashboard")
    public String customerDashboard() {
        return "forward:/customer-dashboard.html";
    }

    @GetMapping("/page/customer/profile")
    public String customerProfile() {
        return "forward:/customer-profile.html";
    }

    /**
     * =============================================
     * COMMON PAGES
     * =============================================
     */

    @GetMapping("/page/profile")
    public String profile() {
        return "forward:/profile.html";
    }

    @GetMapping("/page/logout")
    public String logout() {
        return "forward:/logout.html";
    }
}