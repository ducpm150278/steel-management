package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.CategoryDTO;
import com.steelmanagement.steel_management.entity.Category;
import com.steelmanagement.steel_management.repository.CategoryRepository;
import com.steelmanagement.steel_management.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategoriesByParent(Integer parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getRootCategories() {
        return categoryRepository.findRootCategories().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCategories();
        }
        return categoryRepository.searchCategories(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setCode(category.getCode());
        dto.setParentId(category.getParentId());
        dto.setSortOrder(category.getSortOrder());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());

        // Đếm số sản phẩm - dùng countByCategoryId của ProductRepository (trả về long)
        long productCount = productRepository.countByCategoryId(category.getId());
        dto.setProductCount(productCount);

        // Lấy tên danh mục cha nếu có
        if (category.getParentId() != null) {
            categoryRepository.findById(category.getParentId()).ifPresent(parent -> {
                dto.setParentName(parent.getName());
            });
        }

        // Đếm số danh mục con
        int childCount = categoryRepository.countByParentId(category.getId());
        dto.setChildCount(childCount);

        return dto;
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        // Kiểm tra code không trùng
        if (categoryRepository.findByCode(dto.getCode()).isPresent()) {
            throw new RuntimeException("Mã danh mục đã tồn tại!");
        }

        // Kiểm tra parentId có tồn tại không (nếu có)
        if (dto.getParentId() != null) {
            categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Danh mục cha không tồn tại!"));
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setCode(dto.getCode());
        category.setParentId(dto.getParentId());
        category.setSortOrder(dto.getSortOrder());
        category.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        category.setCreatedAt(LocalDateTime.now());

        Category saved = categoryRepository.save(category);
        return convertToDTO(saved);
    }

    @Transactional
    public CategoryDTO updateCategory(Integer id, CategoryDTO dto) {
        return categoryRepository.findById(id)
                .map(category -> {
                    // Kiểm tra code trùng (nếu thay đổi code)
                    if (!category.getCode().equals(dto.getCode())) {
                        if (categoryRepository.findByCode(dto.getCode()).isPresent()) {
                            throw new RuntimeException("Mã danh mục đã tồn tại!");
                        }
                    }

                    // Kiểm tra parentId có tồn tại không (nếu có)
                    if (dto.getParentId() != null) {
                        // Không cho phép đặt parent là chính nó
                        if (dto.getParentId().equals(id)) {
                            throw new RuntimeException("Không thể đặt danh mục cha là chính nó!");
                        }
                        categoryRepository.findById(dto.getParentId())
                                .orElseThrow(() -> new RuntimeException("Danh mục cha không tồn tại!"));
                    }

                    category.setName(dto.getName());
                    category.setCode(dto.getCode());
                    category.setParentId(dto.getParentId());
                    category.setSortOrder(dto.getSortOrder());
                    category.setIsActive(dto.getIsActive());

                    Category updated = categoryRepository.save(category);
                    return convertToDTO(updated);
                })
                .orElse(null);
    }

    @Transactional
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        // Kiểm tra có danh mục con không
        int childCount = categoryRepository.countByParentId(id);
        if (childCount > 0) {
            throw new RuntimeException("Không thể xóa danh mục có chứa danh mục con!");
        }

        // Kiểm tra có sản phẩm không
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new RuntimeException("Không thể xóa danh mục đang có sản phẩm!");
        }

        categoryRepository.deleteById(id);
    }

    @Transactional
    public void toggleActive(Integer id) {
        categoryRepository.findById(id)
                .map(category -> {
                    category.setIsActive(!category.getIsActive());
                    return categoryRepository.save(category);
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
    }
}