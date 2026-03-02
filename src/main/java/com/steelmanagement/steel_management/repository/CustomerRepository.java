package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByCustomerCode(String customerCode);

    List<Customer> findByCustomerType(String customerType);

    @Query("SELECT c FROM Customer c WHERE " +
            "LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "c.phone LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Customer> searchCustomers(@Param("keyword") String keyword);

    // Thêm method này để lấy mã khách hàng lớn nhất (dùng cho auto-generate code)
    @Query("SELECT MAX(c.customerCode) FROM Customer c WHERE c.customerCode LIKE 'KH%'")
    String findMaxCustomerCode();

    List<Customer> findByIsActive(Boolean isActive);
}