package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.ContractDTO;
import com.steelmanagement.steel_management.dto.ContractItemDTO;
import com.steelmanagement.steel_management.entity.*;
import com.steelmanagement.steel_management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContractService {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractDetailRepository contractDetailRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ConstructionRepository constructionRepository;

    // ========== Entity methods ==========

    @Transactional
    public Contract saveContract(Contract contract) {
        if (contract.getId() == null) {
            contract.setCreatedAt(LocalDateTime.now());
        }
        contract.setUpdatedAt(LocalDateTime.now());

        Contract savedContract = contractRepository.save(contract);

        if (contract.getItems() != null && !contract.getItems().isEmpty()) {
            if (contract.getId() != null) {
                contractDetailRepository.deleteByContractId(contract.getId());
            }

            for (ContractItemDTO itemDto : contract.getItems()) {
                ContractDetail detail = new ContractDetail();
                detail.setContractId(savedContract.getId());
                detail.setProductId(itemDto.getProductId());
                detail.setQuantity(itemDto.getQuantity());
                detail.setUnit(itemDto.getUnit());
                detail.setLength(itemDto.getLength());
                detail.setUnitPrice(itemDto.getUnitPrice());
                detail.setDiscountPercent(itemDto.getDiscountPercent() != null ? itemDto.getDiscountPercent() : 0);
                detail.setNotes(itemDto.getNotes());
                detail.setConstructionDetailId(itemDto.getConstructionDetailId());
                detail.setCreatedAt(LocalDateTime.now());

                contractDetailRepository.save(detail);
            }
        }

        return savedContract;
    }

    public Contract getContractEntityById(Integer id) {
        return contractRepository.findById(id).orElse(null);
    }

    public List<Contract> getAllContractsEntity() {
        return contractRepository.findAll();
    }

    @Transactional
    public void deleteContract(Integer id) {
        contractDetailRepository.deleteByContractId(id);
        contractRepository.deleteById(id);
    }

    public long countContracts() {
        return contractRepository.count();
    }

    @Transactional
    public Contract submitContract(Integer id) {
        Contract contract = getContractEntityById(id);
        if (contract == null) return null;

        contract.setContractStatus("Pending");
        // 🟢 ĐÃ XÓA dòng contract.setSubmittedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());

        return contractRepository.save(contract);
    }

    @Transactional
    public Contract updateContractPartial(Integer id, Contract updates) {
        Contract contract = getContractEntityById(id);
        if (contract == null) return null;

        if (updates.getContractDate() != null) contract.setContractDate(updates.getContractDate());
        if (updates.getDeliveryDate() != null) contract.setDeliveryDate(updates.getDeliveryDate());
        if (updates.getContractStatus() != null) contract.setContractStatus(updates.getContractStatus());
        if (updates.getPaymentMethod() != null) contract.setPaymentMethod(updates.getPaymentMethod());
        if (updates.getPaymentStatus() != null) contract.setPaymentStatus(updates.getPaymentStatus());
        if (updates.getDepositAmount() != null) contract.setDepositAmount(updates.getDepositAmount());
        if (updates.getNotes() != null) contract.setNotes(updates.getNotes());

        contract.setUpdatedAt(LocalDateTime.now());

        return contractRepository.save(contract);
    }

    // ========== DTO methods ==========

    public List<ContractDTO> getContractsByStaff(Integer staffId) {
        List<Contract> contracts = contractRepository.findByCreatedBy(staffId);
        return contracts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ContractDTO getContractById(Integer id) {
        return contractRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<ContractDTO> getAllContracts() {
        return contractRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ContractDTO> getContractsByStatus(String status) {
        return contractRepository.findByContractStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ContractDTO convertToDTO(Contract contract) {
        ContractDTO dto = new ContractDTO();
        dto.setId(contract.getId());
        dto.setContractNumber(contract.getContractNumber());
        dto.setConstructionId(contract.getConstructionId());
        dto.setCustomerId(contract.getCustomerId());
        dto.setContractDate(contract.getContractDate());
        dto.setDeliveryDate(contract.getDeliveryDate());
        dto.setContractStatus(contract.getContractStatus());
        dto.setPaymentStatus(contract.getPaymentStatus());
        dto.setPaymentMethod(contract.getPaymentMethod());
        dto.setTotalAmount(contract.getTotalAmount());
        dto.setVatAmount(contract.getVatAmount());
        dto.setFinalAmount(contract.getFinalAmount());
        dto.setDepositAmount(contract.getDepositAmount());
        dto.setPaymentTerms(contract.getPaymentTerms());
        dto.setDeliveryTerms(contract.getDeliveryTerms());
        dto.setTechnicalRequirements(contract.getTechnicalRequirements());
        dto.setPromotionId(contract.getPromotionId());
        dto.setPromotionCode(contract.getPromotionCode());
        dto.setPromotionDiscountAmount(contract.getPromotionDiscountAmount());
        dto.setNotes(contract.getNotes());
        dto.setCreatedAt(contract.getCreatedAt());
        dto.setUpdatedAt(contract.getUpdatedAt());
        // 🟢 ĐÃ XÓA dòng dto.setSubmittedAt(contract.getSubmittedAt());
        dto.setCreatedBy(contract.getCreatedBy());
        dto.setApprovedBy(contract.getApprovedBy());

        if (contract.getConstructionId() != null) {
            constructionRepository.findById(contract.getConstructionId()).ifPresent(construction -> {
                dto.setConstructionName(construction.getConstructionName());
            });
        }

        if (contract.getCustomerId() != null) {
            customerRepository.findById(contract.getCustomerId()).ifPresent(customer -> {
                dto.setCustomerName(customer.getFullName());
                dto.setCustomerPhone(customer.getPhone());
            });
        }

        if (contract.getCreatedBy() != null) {
            userRepository.findById(contract.getCreatedBy()).ifPresent(user -> {
                dto.setCreatedByName(user.getFullName());
            });
        }

        List<ContractItemDTO> items = contractDetailRepository.findByContractId(contract.getId())
                .stream()
                .map(this::convertToItemDTO)
                .collect(Collectors.toList());
        dto.setItems(items);

        return dto;
    }

    private ContractItemDTO convertToItemDTO(ContractDetail detail) {
        ContractItemDTO dto = new ContractItemDTO();
        dto.setId(detail.getId());
        dto.setProductId(detail.getProductId());
        dto.setQuantity(detail.getQuantity());
        dto.setUnit(detail.getUnit());
        dto.setLength(detail.getLength());
        dto.setUnitPrice(detail.getUnitPrice());
        dto.setDiscountPercent(detail.getDiscountPercent());
        dto.setTotalPrice(detail.getTotalPrice());
        dto.setNotes(detail.getNotes());
        dto.setConstructionDetailId(detail.getConstructionDetailId());

        if (detail.getProductId() != null) {
            productRepository.findById(detail.getProductId()).ifPresent(product -> {
                dto.setProductName(product.getName());
                dto.setProductCode(product.getProductCode());
            });
        }

        return dto;
    }

    public List<Contract> getContractsByConstructionId(Integer constructionId) {
        return contractRepository.findByConstructionId(constructionId);
    }
}