package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Integer> {
    List<ProductCategory> findByIsActiveTrue();
    ProductCategory findByCode(String code);
    List<ProductCategory> findByParentId(Integer parentId);
    List<ProductCategory> findByParentIdIsNull(); // Lấy danh mục gốc
}