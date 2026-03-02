package com.steelmanagement.steel_management.controller;

import com.steelmanagement.steel_management.dto.ApiResponse;
import com.steelmanagement.steel_management.entity.Customer;
import com.steelmanagement.steel_management.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/customers")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // GET: Lấy tất cả khách hàng
    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    // GET: Tìm kiếm khách hàng
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Customer>>> searchCustomers(
            @RequestParam(required = false) String keyword) {
        List<Customer> customers = customerService.searchCustomers(keyword);
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    // GET: Lấy khách hàng theo loại
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<Customer>>> getCustomersByType(@PathVariable String type) {
        List<Customer> customers = customerService.getCustomersByType(type);
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    // GET: Lấy khách hàng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerById(@PathVariable Integer id) {
        Customer customer = customerService.getCustomerById(id);
        if (customer != null) {
            return ResponseEntity.ok(ApiResponse.success(customer));
        }
        return ResponseEntity.notFound().build();
    }

    // GET: Lấy mã khách hàng cuối cùng (để tạo mã tự động)
    @GetMapping("/last-code")
    public ResponseEntity<ApiResponse<String>> getLastCustomerCode() {
        String lastCode = customerService.getLastCustomerCode();
        return ResponseEntity.ok(ApiResponse.success(lastCode));
    }

    // POST: Thêm khách hàng mới
    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> createCustomer(@RequestBody Customer customer) {
        Customer createdCustomer = customerService.createCustomer(customer);
        return ResponseEntity.ok(ApiResponse.success("Thêm khách hàng thành công", createdCustomer));
    }

    // PUT: Cập nhật khách hàng
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(
            @PathVariable Integer id, @RequestBody Customer customer) {
        Customer updatedCustomer = customerService.updateCustomer(id, customer);
        if (updatedCustomer != null) {
            return ResponseEntity.ok(ApiResponse.success("Cập nhật khách hàng thành công", updatedCustomer));
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE: Xóa khách hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa khách hàng thành công", null));
    }
}