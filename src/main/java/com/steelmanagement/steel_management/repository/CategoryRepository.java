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

    // Tìm theo parentId
    List<Category> findByParentId(Integer parentId);

    // Đếm số danh mục con
    int countByParentId(Integer parentId);

    // Tìm danh mục gốc (parentId = null)
    @Query("SELECT c FROM Category c WHERE c.parentId IS NULL ORDER BY c.sortOrder")
    List<Category> findRootCategories();

    // Tìm theo code
    Optional<Category> findByCode(String code);

    // Tìm danh mục đang hoạt động
    List<Category> findByIsActiveTrue();

    // Tìm kiếm theo tên hoặc code
    @Query("SELECT c FROM Category c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> searchCategories(@Param("keyword") String keyword);

    // Lấy tất cả danh mục cùng với số lượng sản phẩm (dùng cho thống kê)
    @Query("SELECT c, SIZE(c.products) FROM Category c")
    List<Object[]> findAllWithProductCount();

    // Kiểm tra xem có danh mục con không
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Category c WHERE c.parentId = :parentId")
    boolean hasChildren(@Param("parentId") Integer parentId);
}