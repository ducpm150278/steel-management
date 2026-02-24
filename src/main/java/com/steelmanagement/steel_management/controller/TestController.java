package com.steelmanagement.steel_management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class TestController {

    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "Server is running!";
    }

    @GetMapping("/test-page")
    public String testPage() {
        return "forward:/index.html";
    }
}