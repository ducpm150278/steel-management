package com.steelmanagement.steel_management.controller;

import com.steelmanagement.steel_management.dto.ApiResponse;
import com.steelmanagement.steel_management.dto.CategoryDTO;
import com.steelmanagement.steel_management.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getRootCategories() {
        List<CategoryDTO> categories = categoryService.getRootCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(@PathVariable Integer id) {
        CategoryDTO category = categoryService.getCategoryById(id);
        if (category != null) {
            return ResponseEntity.ok(ApiResponse.success(category));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategoriesByParent(@PathVariable Integer parentId) {
        List<CategoryDTO> categories = categoryService.getCategoriesByParent(parentId);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    // 🟢 Method search - dòng 48 trong file của bạn
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> searchCategories(@RequestParam String keyword) {
        List<CategoryDTO> categories = categoryService.searchCategories(keyword);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO created = categoryService.createCategory(categoryDTO);
        return ResponseEntity.ok(ApiResponse.success("Thêm danh mục thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @PathVariable Integer id, @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updated = categoryService.updateCategory(id, categoryDTO);
        if (updated != null) {
            return ResponseEntity.ok(ApiResponse.success("Cập nhật danh mục thành công", updated));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa danh mục thành công", null));
    }
}