package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.ConstructionDTO;
import com.steelmanagement.steel_management.dto.ConstructionDetailDTO;
import com.steelmanagement.steel_management.dto.ConstructionItemDTO;
import com.steelmanagement.steel_management.entity.Construction;
import com.steelmanagement.steel_management.entity.ConstructionDetail;
import com.steelmanagement.steel_management.entity.Customer;
import com.steelmanagement.steel_management.entity.User;
import com.steelmanagement.steel_management.repository.ConstructionDetailRepository;
import com.steelmanagement.steel_management.repository.ConstructionRepository;
import com.steelmanagement.steel_management.repository.CustomerRepository;
import com.steelmanagement.steel_management.repository.ProductRepository;
import com.steelmanagement.steel_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConstructionService {

    @Autowired
    private ConstructionRepository constructionRepository;

    @Autowired
    private ConstructionDetailRepository constructionDetailRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // ========== Entity methods ==========

    public Construction saveConstruction(Construction construction) {
        return constructionRepository.save(construction);
    }

    public List<Construction> getConstructionsByStaffEntity(Integer staffId) {
        return constructionRepository.findByCreatedBy(staffId);
    }

    public Construction getConstructionByIdEntity(Integer id) {
        return constructionRepository.findById(id).orElse(null);
    }

    public List<Construction> getAllConstructionsEntity() {
        return constructionRepository.findAll();
    }

    public List<Construction> getConstructionsByStatusEntity(String status) {
        return constructionRepository.findByConstructionStatus(status);
    }

    @Transactional
    public void deleteConstruction(Integer id) {
        // Xóa các chi tiết trước
        constructionDetailRepository.deleteByConstructionId(id);
        // Xóa công trình
        constructionRepository.deleteById(id);
    }

    @Transactional
    public Construction submitConstruction(Integer id) {
        Construction construction = getConstructionByIdEntity(id);
        if (construction == null) return null;

        construction.setConstructionStatus("Submitted");
        construction.setSubmittedAt(LocalDateTime.now());

        return constructionRepository.save(construction);
    }

    // ========== DTO methods for list ==========

    public List<ConstructionDTO> getConstructionsByStaff(Integer staffId) {
        List<Construction> constructions = constructionRepository.findByCreatedBy(staffId);
        return constructions.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    public List<ConstructionDTO> getAllConstructions() {
        List<Construction> constructions = constructionRepository.findAll();
        return constructions.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    // 🟢 THÊM METHOD NÀY - Lấy công trình theo trạng thái
    public List<ConstructionDTO> getConstructionsByStatus(String status) {
        List<Construction> constructions = constructionRepository.findByConstructionStatus(status);
        return constructions.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    private ConstructionDTO convertToListDTO(Construction construction) {
        ConstructionDTO dto = new ConstructionDTO();
        dto.setId(construction.getId());
        dto.setConstructionCode(construction.getConstructionCode());
        dto.setConstructionName(construction.getConstructionName());
        dto.setCustomerId(construction.getCustomerId());
        dto.setDescription(construction.getDescription());
        dto.setConstructionStatus(construction.getConstructionStatus());
        dto.setSubmittedAt(construction.getSubmittedAt());
        dto.setNotes(construction.getNotes());
        dto.setPromotionId(construction.getPromotionId());
        dto.setPromotionCode(construction.getPromotionCode());
        dto.setPromotionDiscountAmount(construction.getPromotionDiscountAmount());
        dto.setCreatedAt(construction.getCreatedAt());
        dto.setUpdatedAt(construction.getUpdatedAt());
        dto.setCreatedBy(construction.getCreatedBy());

        // Lấy thông tin khách hàng
        if (construction.getCustomerId() != null) {
            customerRepository.findById(construction.getCustomerId()).ifPresent(customer -> {
                dto.setCustomerName(customer.getFullName());
                dto.setCustomerPhone(customer.getPhone());
            });
        }

        // Lấy tên người tạo
        if (construction.getCreatedBy() != null) {
            userRepository.findById(construction.getCreatedBy()).ifPresent(user -> {
                dto.setCreatedByName(user.getFullName());
            });
        }

        // Đếm số lượng sản phẩm
        int itemCount = constructionDetailRepository.findByConstructionId(construction.getId()).size();
        dto.setItemCount(itemCount);

        return dto;
    }

    // ========== Detail DTO methods ==========

    public ConstructionDetailDTO getConstructionDetailById(Integer id) {
        return constructionRepository.findById(id)
                .map(this::convertToDetailDTO)
                .orElse(null);
    }

    private ConstructionDetailDTO convertToDetailDTO(Construction construction) {
        ConstructionDetailDTO dto = new ConstructionDetailDTO();
        dto.setId(construction.getId());
        dto.setConstructionCode(construction.getConstructionCode());
        dto.setConstructionName(construction.getConstructionName());
        dto.setCustomerId(construction.getCustomerId());
        dto.setDescription(construction.getDescription());
        dto.setConstructionStatus(construction.getConstructionStatus());
        dto.setSubmittedAt(construction.getSubmittedAt());
        dto.setNotes(construction.getNotes());
        dto.setPromotionId(construction.getPromotionId());
        dto.setPromotionCode(construction.getPromotionCode());
        dto.setPromotionDiscountAmount(construction.getPromotionDiscountAmount());
        dto.setCreatedAt(construction.getCreatedAt());
        dto.setUpdatedAt(construction.getUpdatedAt());
        dto.setCreatedBy(construction.getCreatedBy());

        // Lấy thông tin khách hàng
        if (construction.getCustomerId() != null) {
            customerRepository.findById(construction.getCustomerId()).ifPresent(customer -> {
                dto.setCustomerName(customer.getFullName());
                dto.setCustomerPhone(customer.getPhone());
            });
        }

        // Lấy tên người tạo
        if (construction.getCreatedBy() != null) {
            userRepository.findById(construction.getCreatedBy()).ifPresent(user -> {
                dto.setCreatedByName(user.getFullName());
            });
        }

        // Lấy chi tiết sản phẩm từ ConstructionDetails
        List<ConstructionItemDTO> items = constructionDetailRepository.findByConstructionId(construction.getId())
                .stream()
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
        dto.setItems(items);

        return dto;
    }

    private ConstructionItemDTO convertToItemDTO(ConstructionDetail detail) {
        ConstructionItemDTO dto = new ConstructionItemDTO();
        dto.setId(detail.getId());
        dto.setProductId(detail.getProductId());
        dto.setQuantity(detail.getQuantity());
        dto.setUnit(detail.getUnit());
        dto.setLength(detail.getLength());

        // 🟢 QUAN TRỌNG: Set price từ expectedPrice
        Double price = detail.getExpectedPrice();
        dto.setPrice(price != null ? price : 0);

        // Tính total
        dto.setTotal(dto.getQuantity() * dto.getPrice());

        // Lấy thông tin sản phẩm
        if (detail.getProductId() != null) {
            productRepository.findById(detail.getProductId()).ifPresent(product -> {
                dto.setProductName(product.getName());
                // 🟢 SỬA: Dùng getProductCode() thay vì getCode()
                dto.setProductCode(product.getProductCode());
            });
        }

        return dto;
    }
}