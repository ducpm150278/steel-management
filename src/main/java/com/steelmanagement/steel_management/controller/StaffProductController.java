package com.steelmanagement.steel_management.controller;

import com.steelmanagement.steel_management.dto.ApiResponse;
import com.steelmanagement.steel_management.dto.ProductDTO;
import com.steelmanagement.steel_management.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/staff/products")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffProductController {

    @Autowired
    private ProductService productService;

    /**
     * Lấy tất cả sản phẩm
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts() {
        try {
            List<ProductDTO> products = productService.getAllProducts();
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy danh sách sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Lấy sản phẩm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Integer id) {
        try {
            ProductDTO product = productService.getProductById(id);
            if (product != null) {
                return ResponseEntity.ok(ApiResponse.success("Lấy thông tin sản phẩm thành công", product));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy thông tin sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Tìm kiếm sản phẩm theo từ khóa
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> searchProducts(
            @RequestParam(required = false) String keyword) {
        try {
            List<ProductDTO> products = productService.searchProducts(keyword);
            return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm thành công", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi tìm kiếm sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Lấy sản phẩm theo danh mục
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProductsByCategory(
            @PathVariable Integer categoryId) {
        try {
            List<ProductDTO> products = productService.getProductsByCategory(categoryId);
            return ResponseEntity.ok(ApiResponse.success("Lấy sản phẩm theo danh mục thành công", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy sản phẩm theo danh mục: " + e.getMessage()));
        }
    }

    /**
     * Lấy sản phẩm sắp hết hàng
     */
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getLowStockProducts() {
        try {
            List<ProductDTO> products = productService.getLowStockProducts();
            return ResponseEntity.ok(ApiResponse.success("Lấy sản phẩm sắp hết hàng thành công", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy sản phẩm sắp hết hàng: " + e.getMessage()));
        }
    }

    /**
     * Thêm sản phẩm mới
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(@RequestBody ProductDTO productDTO) {
        try {
            // Validate dữ liệu đầu vào
            if (productDTO.getProductCode() == null || productDTO.getProductCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Mã sản phẩm không được để trống"));
            }
            if (productDTO.getName() == null || productDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Tên sản phẩm không được để trống"));
            }
            if (productDTO.getCategoryId() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Danh mục sản phẩm không được để trống"));
            }
            if (productDTO.getUnit() == null || productDTO.getUnit().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Đơn vị tính không được để trống"));
            }

            ProductDTO createdProduct = productService.createProduct(productDTO);
            return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm thành công", createdProduct));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi thêm sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật sản phẩm
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Integer id,
            @RequestBody ProductDTO productDTO) {
        try {
            // Validate dữ liệu đầu vào
            if (productDTO.getProductCode() == null || productDTO.getProductCode().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Mã sản phẩm không được để trống"));
            }
            if (productDTO.getName() == null || productDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Tên sản phẩm không được để trống"));
            }
            if (productDTO.getCategoryId() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Danh mục sản phẩm không được để trống"));
            }

            ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
            if (updatedProduct != null) {
                return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", updatedProduct));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi cập nhật sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Xóa sản phẩm
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Integer id) {
        try {
            // Kiểm tra sản phẩm có tồn tại không
            ProductDTO existingProduct = productService.getProductById(id);
            if (existingProduct == null) {
                return ResponseEntity.notFound().build();
            }

            productService.deleteProduct(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi xóa sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Xóa nhiều sản phẩm cùng lúc
     */
    @DeleteMapping("/bulk-delete")
    public ResponseEntity<ApiResponse<Void>> bulkDeleteProducts(@RequestBody List<Integer> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Danh sách ID sản phẩm không được để trống"));
            }

            for (Integer id : ids) {
                productService.deleteProduct(id);
            }

            return ResponseEntity.ok(ApiResponse.success("Xóa " + ids.size() + " sản phẩm thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi xóa nhiều sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật trạng thái sản phẩm (active/inactive)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProductStatus(
            @PathVariable Integer id,
            @RequestParam Boolean isActive) {
        try {
            ProductDTO existingProduct = productService.getProductById(id);
            if (existingProduct == null) {
                return ResponseEntity.notFound().build();
            }

            existingProduct.setIsActive(isActive);
            ProductDTO updatedProduct = productService.updateProduct(id, existingProduct);

            String statusText = isActive ? "kích hoạt" : "ngừng kích hoạt";
            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái sản phẩm thành công: " + statusText, updatedProduct));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi cập nhật trạng thái sản phẩm: " + e.getMessage()));
        }
    }

    /**
     * Kiểm tra mã sản phẩm đã tồn tại chưa
     */
    @GetMapping("/check-code")
    public ResponseEntity<ApiResponse<Boolean>> checkProductCode(@RequestParam String code) {
        try {
            List<ProductDTO> products = productService.getAllProducts();
            boolean exists = products.stream()
                    .anyMatch(p -> p.getProductCode().equalsIgnoreCase(code));

            return ResponseEntity.ok(ApiResponse.success("Kiểm tra mã sản phẩm thành công", exists));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi kiểm tra mã sản phẩm: " + e.getMessage()));
        }
    }
}