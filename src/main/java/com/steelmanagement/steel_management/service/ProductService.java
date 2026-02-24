package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.ProductDTO;
import com.steelmanagement.steel_management.entity.Product;
import com.steelmanagement.steel_management.repository.InventoryRepository;
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

    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::enrichWithInventoryData)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(keyword)
                .stream()
                .map(this::enrichWithInventoryData)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Integer id) {
        return productRepository.findById(id)
                .map(this::enrichWithInventoryData)
                .orElse(null);
    }

    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findLowStockProducts()
                .stream()
                .map(this::enrichWithInventoryData)
                .collect(Collectors.toList());
    }

    private ProductDTO enrichWithInventoryData(Product product) {
        ProductDTO dto = ProductDTO.fromEntity(product);

        inventoryRepository.findByProductId(product.getId()).ifPresent(inventory -> {
            dto.setStockQuantity(inventory.getQuantity());
            dto.setMinStockLevel(inventory.getMinStockLevel());
        });

        return dto;
    }

    public ProductDTO createProduct(Product product) {
        product.setCreatedAt(java.time.LocalDateTime.now());
        product.setIsActive(true);
        Product savedProduct = productRepository.save(product);
        return ProductDTO.fromEntity(savedProduct);
    }

    public ProductDTO updateProduct(Integer id, Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productDetails.getName());
                    product.setDescription(productDetails.getDescription());
                    product.setSpecifications(productDetails.getSpecifications());
                    product.setUnit(productDetails.getUnit());
                    product.setIsActive(productDetails.getIsActive());
                    product.setUpdatedAt(java.time.LocalDateTime.now());
                    return ProductDTO.fromEntity(productRepository.save(product));
                })
                .orElse(null);
    }

    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }
}