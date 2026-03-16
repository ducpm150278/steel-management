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

    @GetMapping("/my-contracts/{staffId}")
    public ResponseEntity<ApiResponse<List<ContractDTO>>> getMyContracts(@PathVariable Integer staffId) {
        List<ContractDTO> contracts = contractService.getContractsByStaff(staffId);
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<ContractDTO>> getContractDetail(@PathVariable Integer id) {
        ContractDTO contract = contractService.getContractById(id);
        if (contract != null) {
            return ResponseEntity.ok(ApiResponse.success(contract));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Contract>> updateContract(
            @PathVariable Integer id,
            @RequestBody Contract contract) {
        Contract updated = contractService.updateContractPartial(id, contract);
        if (updated != null) {
            return ResponseEntity.ok(ApiResponse.success("Cập nhật hợp đồng thành công", updated));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<Contract>> submitContract(@PathVariable Integer id) {
        Contract updated = contractService.submitContract(id);
        if (updated != null) {
            return ResponseEntity.ok(ApiResponse.success("Gửi duyệt hợp đồng thành công", updated));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContract(@PathVariable Integer id) {
        contractService.deleteContract(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa hợp đồng thành công", null));
    }
}