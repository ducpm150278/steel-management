package com.steelmanagement.steel_management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    @GetMapping("/user-management")
    public String userManagement() {
        return "forward:/index.html";
    }

    @GetMapping("/promotion-management")
    public String promotionManagement() {
        return "forward:/promotion-management.html";
    }

    @GetMapping("/contract-management")
    public String contractManagement() {
        return "forward:/contract-management.html";
    }

    @GetMapping("/staff-contract")
    public String staffContract() {
        return "forward:/staff-contract.html";
    }
}