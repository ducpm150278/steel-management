package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByCategoryId(Integer categoryId);

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.productCode) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    @Query(value = "SELECT p.* FROM Products p " +
            "JOIN Inventory i ON p.id = i.product_id " +
            "WHERE i.quantity <= i.min_stock_level", nativeQuery = true)
    List<Product> findLowStockProducts();

    List<Product> findByIsActive(Boolean isActive);
}