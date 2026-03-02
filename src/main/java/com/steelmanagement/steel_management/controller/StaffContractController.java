package com.steelmanagement.steel_management.controller;

import com.steelmanagement.steel_management.dto.ApiResponse;
import com.steelmanagement.steel_management.dto.ContractDTO;
import com.steelmanagement.steel_management.entity.Contract;
import com.steelmanagement.steel_management.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/staff/contracts")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffContractController {

    @Autowired
    private ContractService contractService;

    /**
     * Lấy danh sách hợp đồng của staff theo ID
     * URL: GET /staff/contracts/my-contracts/{staffId}
     */
    @GetMapping("/my-contracts/{staffId}")
    public ResponseEntity<ApiResponse<List<ContractDTO>>> getMyContracts(@PathVariable Integer staffId) {
        List<ContractDTO> contracts = contractService.getContractsByStaff(staffId);
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }

    /**
     * Lấy chi tiết hợp đồng theo ID
     * URL: GET /staff/contracts/detail/{id}
     */
    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<ContractDTO>> getContractDetail(@PathVariable Integer id) {
        ContractDTO contract = contractService.getContractById(id);
        if (contract != null) {
            return ResponseEntity.ok(ApiResponse.success(contract));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Lưu hợp đồng dưới dạng Draft (bản nháp)
     * URL: POST /staff/contracts/draft
     */
    @PostMapping("/draft")
    public ResponseEntity<ApiResponse<Contract>> saveDraft(@RequestBody Contract contract) {
        contract.setContractStatus("Draft");
        contract.setCreatedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());

        // Tự động sinh số hợp đồng nếu chưa có
        if (contract.getContractNumber() == null || contract.getContractNumber().isEmpty()) {
            contract.setContractNumber(generateContractNumber());
        }

        Contract saved = contractService.saveContract(contract);
        return ResponseEntity.ok(ApiResponse.success("Lưu nháp hợp đồng thành công", saved));
    }

    /**
     * Gửi hợp đồng để duyệt (chuyển từ Draft sang Submitted/Pending)
     * URL: POST /staff/contracts/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Contract>> submitContract(@RequestBody Contract contract) {
        contract.setContractStatus("Pending");
        contract.setSubmittedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());

        // Tự động sinh số hợp đồng nếu chưa có
        if (contract.getContractNumber() == null || contract.getContractNumber().isEmpty()) {
            contract.setContractNumber(generateContractNumber());
        }

        Contract saved = contractService.saveContract(contract);
        return ResponseEntity.ok(ApiResponse.success("Gửi duyệt hợp đồng thành công", saved));
    }

    /**
     * Cập nhật hợp đồng
     * URL: PUT /staff/contracts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Contract>> updateContract(
            @PathVariable Integer id,
            @RequestBody Contract contract) {

        Contract existingContract = contractService.getContractEntityById(id);
        if (existingContract == null) {
            return ResponseEntity.notFound().build();
        }

        // Chỉ cho phép cập nhật nếu hợp đồng đang ở trạng thái Draft
        if (!"Draft".equals(existingContract.getContractStatus())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không thể cập nhật hợp đồng đã gửi duyệt"));
        }

        contract.setId(id);
        contract.setUpdatedAt(LocalDateTime.now());

        // Giữ nguyên các trường không được gửi lên
        contract.setCreatedAt(existingContract.getCreatedAt());
        contract.setCreatedBy(existingContract.getCreatedBy());

        Contract updated = contractService.saveContract(contract);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hợp đồng thành công", updated));
    }

    /**
     * Gửi duyệt hợp đồng theo ID
     * URL: PUT /staff/contracts/{id}/submit
     */
    @PutMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<Contract>> submitContractById(@PathVariable Integer id) {
        Contract contract = contractService.getContractEntityById(id);
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }

        // Chỉ cho phép gửi duyệt nếu hợp đồng đang ở trạng thái Draft
        if (!"Draft".equals(contract.getContractStatus())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Hợp đồng này đã được gửi duyệt hoặc đã xử lý"));
        }

        contract.setContractStatus("Pending");
        contract.setSubmittedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());

        Contract updated = contractService.saveContract(contract);
        return ResponseEntity.ok(ApiResponse.success("Gửi duyệt hợp đồng thành công", updated));
    }

    /**
     * Xóa hợp đồng
     * URL: DELETE /staff/contracts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContract(@PathVariable Integer id) {
        Contract contract = contractService.getContractEntityById(id);
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }

        // Chỉ cho phép xóa nếu hợp đồng đang ở trạng thái Draft
        if (!"Draft".equals(contract.getContractStatus())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không thể xóa hợp đồng đã gửi duyệt"));
        }

        contractService.deleteContract(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa hợp đồng thành công", null));
    }

    /**
     * Helper method để sinh số hợp đồng
     */
    private String generateContractNumber() {
        // Format: HD-YYYYMMDD-XXX
        String datePart = java.time.LocalDate.now().toString().replace("-", "");
        long count = contractService.countContracts() + 1;
        String numberPart = String.format("%03d", count);
        return "HD-" + datePart + "-" + numberPart;
    }
}