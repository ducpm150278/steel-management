package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.ContractDTO;
import com.steelmanagement.steel_management.dto.ContractItemDTO;  // Sửa import này
import com.steelmanagement.steel_management.dto.ProductDTO;
import com.steelmanagement.steel_management.entity.Contract;
import com.steelmanagement.steel_management.entity.ContractDetail;
import com.steelmanagement.steel_management.entity.Customer;
import com.steelmanagement.steel_management.entity.User;
import com.steelmanagement.steel_management.repository.ContractRepository;
import com.steelmanagement.steel_management.repository.CustomerRepository;
import com.steelmanagement.steel_management.repository.ProductRepository;
import com.steelmanagement.steel_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContractService {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // ========== Entity methods ==========

    public Contract saveContract(Contract contract) {
        return contractRepository.save(contract);
    }

    public Contract getContractEntityById(Integer id) {
        return contractRepository.findById(id).orElse(null);
    }

    public List<Contract> getAllContractsEntity() {
        return contractRepository.findAll();
    }

    public void deleteContract(Integer id) {
        contractRepository.deleteById(id);
    }

    public long countContracts() {
        return contractRepository.count();
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

    public ContractDTO updateContractStatus(Integer id, String status) {
        return contractRepository.findById(id)
                .map(contract -> {
                    contract.setContractStatus(status);
                    contract.setUpdatedAt(java.time.LocalDateTime.now());
                    return convertToDTO(contractRepository.save(contract));
                })
                .orElse(null);
    }

    public ContractDTO rejectContract(Integer id, String reason) {
        return contractRepository.findById(id)
                .map(contract -> {
                    contract.setContractStatus("Rejected");
                    contract.setNotes(reason);
                    contract.setUpdatedAt(java.time.LocalDateTime.now());
                    return convertToDTO(contractRepository.save(contract));
                })
                .orElse(null);
    }

    private ContractDTO convertToDTO(Contract contract) {
        ContractDTO dto = new ContractDTO();
        dto.setId(contract.getId());
        dto.setContractNumber(contract.getContractNumber());

        // Lấy thông tin công trình
        if (contract.getConstructionId() != null) {
            dto.setConstructionName("Công trình #" + contract.getConstructionId());
        }

        // Lấy thông tin khách hàng
        if (contract.getCustomerId() != null) {
            customerRepository.findById(contract.getCustomerId()).ifPresent(customer -> {
                dto.setCustomerName(customer.getFullName());
                dto.setCustomerPhone(customer.getPhone());
            });
        }

        // Lấy thông tin nhân viên tạo
        if (contract.getCreatedBy() != null) {
            userRepository.findById(contract.getCreatedBy()).ifPresent(user -> {
                dto.setStaffName(user.getFullName());
                dto.setStaffRole(user.getUserRole());
            });
        }

        dto.setCreatedDate(contract.getCreatedAt());
        dto.setStatus(contract.getContractStatus());
        dto.setTotalAmount(contract.getTotalAmount());
        dto.setPromotionCode(contract.getPromotionCode());
        dto.setPromotionDiscount(contract.getPromotionDiscountAmount());
        dto.setFinalAmount(contract.getFinalAmount());
        dto.setNotes(contract.getNotes());

        // Lấy chi tiết sản phẩm
        if (contract.getContractDetails() != null && !contract.getContractDetails().isEmpty()) {
            List<ContractItemDTO> items = contract.getContractDetails().stream()
                    .map(this::convertToItemDTO)
                    .collect(Collectors.toList());
            dto.setItems(items);  // Đảm bảo ContractDTO có field items
        }

        return dto;
    }

    private ContractItemDTO convertToItemDTO(ContractDetail detail) {
        ContractItemDTO dto = new ContractItemDTO();

        dto.setProductId(detail.getProductId());
        dto.setQuantity(detail.getQuantity());
        dto.setUnit(detail.getUnit() != null ? detail.getUnit() : "cây");
        dto.setPrice(detail.getUnitPrice() != null ? detail.getUnitPrice() : 0);
        dto.setTotal(detail.getTotalPrice() != null ? detail.getTotalPrice() :
                (detail.getQuantity() * detail.getUnitPrice()));

        // Lấy thông tin sản phẩm từ ProductRepository
        if (detail.getProductId() != null) {
            productRepository.findById(detail.getProductId()).ifPresent(product -> {
                dto.setProductName(product.getName());
                dto.setProductCode(product.getProductCode());

                // Có thể set thêm thông tin chi tiết
                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(product.getId());
                productDTO.setProductCode(product.getProductCode());
                productDTO.setName(product.getName());
                productDTO.setUnit(product.getUnit());
                productDTO.setPrice(detail.getUnitPrice());
                dto.setProductDetails(productDTO);
            });
        }

        return dto;
    }
}