package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.entity.Customer;
import com.steelmanagement.steel_management.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    // READ - Lấy tất cả khách hàng
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // READ - Lấy khách hàng theo ID
    public Customer getCustomerById(Integer id) {
        return customerRepository.findById(id).orElse(null);
    }

    // READ - Lấy khách hàng theo loại
    public List<Customer> getCustomersByType(String type) {
        return customerRepository.findByCustomerType(type);
    }

    // READ - Tìm kiếm khách hàng
    public List<Customer> searchCustomers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.searchCustomers(keyword);
    }

    // CREATE - Thêm khách hàng mới
    public Customer createCustomer(Customer customer) {
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());
        customer.setIsActive(customer.getIsActive() != null ? customer.getIsActive() : true);

        // Tạo mã khách hàng tự động nếu chưa có
        if (customer.getCustomerCode() == null || customer.getCustomerCode().isEmpty()) {
            String lastCode = customerRepository.findMaxCustomerCode();
            int nextNumber = 1;
            if (lastCode != null && lastCode.startsWith("KH")) {
                nextNumber = Integer.parseInt(lastCode.substring(2)) + 1;
            }
            customer.setCustomerCode(String.format("KH%03d", nextNumber));
        }

        return customerRepository.save(customer);
    }

    // UPDATE - Cập nhật thông tin khách hàng
    public Customer updateCustomer(Integer id, Customer customerDetails) {
        return customerRepository.findById(id)
                .map(customer -> {
                    // Cập nhật các trường thông tin
                    customer.setCustomerCode(customerDetails.getCustomerCode());
                    customer.setFullName(customerDetails.getFullName());
                    customer.setPhone(customerDetails.getPhone());
                    customer.setEmail(customerDetails.getEmail());
                    customer.setAddress(customerDetails.getAddress());
                    customer.setTaxCode(customerDetails.getTaxCode());
                    customer.setCustomerType(customerDetails.getCustomerType());
                    customer.setPaymentTerms(customerDetails.getPaymentTerms());
                    customer.setCreditLimit(customerDetails.getCreditLimit());
                    customer.setIsActive(customerDetails.getIsActive());
                    customer.setUpdatedAt(LocalDateTime.now());

                    return customerRepository.save(customer);
                })
                .orElse(null);
    }

    // DELETE - Xóa khách hàng
    public void deleteCustomer(Integer id) {
        customerRepository.deleteById(id);
    }

    // Lấy mã khách hàng cuối cùng (dùng để tạo mã tự động)
    public String getLastCustomerCode() {
        return customerRepository.findMaxCustomerCode();
    }
}