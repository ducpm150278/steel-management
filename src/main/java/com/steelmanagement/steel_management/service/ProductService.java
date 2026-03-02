package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.ProductDTO;
import com.steelmanagement.steel_management.entity.Product;
import com.steelmanagement.steel_management.repository.InventoryRepository;
import com.steelmanagement.steel_management.repository.PriceListRepository;
import com.steelmanagement.steel_management.repository.ProductCategoryRepository;
import com.steelmanagement.steel_management.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private PriceListRepository priceListRepository; // 🟢 Thêm repository cho bảng giá

    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Integer id) {
        return productRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<ProductDTO> getProductsByCategory(Integer categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findLowStockProducts()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setProductCode(product.getProductCode());
        dto.setName(product.getName());
        dto.setCategoryId(product.getCategoryId());

        // Lấy tên danh mục
        if (product.getCategoryId() != null) {
            categoryRepository.findById(product.getCategoryId()).ifPresent(cat ->
                    dto.setCategoryName(cat.getName())
            );
        }

        dto.setDescription(product.getDescription());
        dto.setSpecifications(product.getSpecifications());
        dto.setUnit(product.getUnit());
        dto.setLengthPerUnit(product.getLengthPerUnit());
        dto.setWeightPerUnit(product.getWeightPerUnit());
        dto.setIsActive(product.getIsActive());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        // 🟢 Lấy giá từ bảng PriceLists (giá bán lẻ hiện tại)
        priceListRepository.findCurrentRetailPrice(product.getId()).ifPresent(priceList -> {
            dto.setPrice(priceList.getSalePrice());
        });

        // Nếu không có giá bán lẻ, thử lấy giá bán buôn
        if (dto.getPrice() == null) {
            priceListRepository.findCurrentWholesalePrice(product.getId()).ifPresent(priceList -> {
                dto.setPrice(priceList.getSalePrice());
            });
        }

        // Lấy thông tin tồn kho
        inventoryRepository.findByProductId(product.getId()).ifPresent(inventory -> {
            dto.setStockQuantity(inventory.getQuantity());
            dto.setMinStockLevel(inventory.getMinStockLevel());
        });

        return dto;
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = new Product();
        product.setProductCode(productDTO.getProductCode());
        product.setName(productDTO.getName());
        product.setCategoryId(productDTO.getCategoryId());
        product.setDescription(productDTO.getDescription());
        product.setSpecifications(productDTO.getSpecifications());
        product.setUnit(productDTO.getUnit());
        product.setLengthPerUnit(productDTO.getLengthPerUnit());
        product.setWeightPerUnit(productDTO.getWeightPerUnit());
        product.setIsActive(productDTO.getIsActive() != null ? productDTO.getIsActive() : true);
        product.setCreatedAt(java.time.LocalDateTime.now());

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    public ProductDTO updateProduct(Integer id, ProductDTO productDTO) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setProductCode(productDTO.getProductCode());
                    product.setName(productDTO.getName());
                    product.setCategoryId(productDTO.getCategoryId());
                    product.setDescription(productDTO.getDescription());
                    product.setSpecifications(productDTO.getSpecifications());
                    product.setUnit(productDTO.getUnit());
                    product.setLengthPerUnit(productDTO.getLengthPerUnit());
                    product.setWeightPerUnit(productDTO.getWeightPerUnit());
                    product.setIsActive(productDTO.getIsActive());
                    product.setUpdatedAt(java.time.LocalDateTime.now());

                    Product updatedProduct = productRepository.save(product);
                    return convertToDTO(updatedProduct);
                })
                .orElse(null);
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }
}