package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    Optional<Category> findByCode(String code);

    List<Category> findByParentId(Integer parentId);

    List<Category> findByIsActiveTrue();

    @Query("SELECT c FROM Category c WHERE c.parentId IS NULL")
    List<Category> findRootCategories();

    @Query("SELECT c FROM Category c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> searchCategories(@Param("keyword") String keyword);

    // Đếm sản phẩm theo category (dùng Long vì COUNT trả về Long)
    @Query("SELECT COUNT(p) FROM Product p WHERE p.categoryId = :categoryId")
    Long countProductsByCategory(@Param("categoryId") Integer categoryId);
}