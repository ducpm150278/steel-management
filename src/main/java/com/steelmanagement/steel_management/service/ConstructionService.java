package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.ConstructionDTO;
import com.steelmanagement.steel_management.entity.Construction;
import com.steelmanagement.steel_management.entity.Customer;
import com.steelmanagement.steel_management.entity.User;
import com.steelmanagement.steel_management.repository.ConstructionRepository;
import com.steelmanagement.steel_management.repository.CustomerRepository;
import com.steelmanagement.steel_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConstructionService {

    @Autowired
    private ConstructionRepository constructionRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    public Construction saveConstruction(Construction construction) {
        return constructionRepository.save(construction);
    }

    public List<ConstructionDTO> getConstructionsByStaff(Integer staffId) {
        List<Construction> constructions = constructionRepository.findByCreatedBy(staffId);
        return constructions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ConstructionDTO getConstructionById(Integer id) {
        return constructionRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<ConstructionDTO> getAllConstructions() {
        return constructionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ConstructionDTO> getConstructionsByStatus(String status) {
        return constructionRepository.findByConstructionStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteConstruction(Integer id) {
        constructionRepository.deleteById(id);
    }

    // Thêm method này để submit construction
    public Construction submitConstruction(Integer id) {
        ConstructionDTO dto = getConstructionById(id);
        if (dto == null) return null;

        Construction construction = new Construction();
        construction.setId(id);
        construction.setConstructionStatus("Submitted");
        construction.setSubmittedAt(LocalDateTime.now());

        // Copy các trường từ DTO
        construction.setConstructionCode(dto.getConstructionCode());
        construction.setConstructionName(dto.getConstructionName());
        construction.setCustomerId(dto.getCustomerId());
        construction.setDescription(dto.getDescription());
        construction.setNotes(dto.getNotes());
        construction.setPromotionId(dto.getPromotionId());
        construction.setPromotionCode(dto.getPromotionCode());
        construction.setPromotionDiscountAmount(dto.getPromotionDiscountAmount());
        construction.setCreatedBy(dto.getCreatedBy());
        construction.setCreatedAt(dto.getCreatedAt());

        return constructionRepository.save(construction);
    }

    private ConstructionDTO convertToDTO(Construction construction) {
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

        return dto;
    }
}