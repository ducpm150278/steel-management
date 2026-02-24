package com.steelmanagement.steel_management.controller;

import com.steelmanagement.steel_management.dto.ApiResponse;
import com.steelmanagement.steel_management.entity.Construction;
import com.steelmanagement.steel_management.service.ConstructionService;
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
    private ConstructionService constructionService;

    @PostMapping("/draft")
    public ResponseEntity<ApiResponse<Construction>> saveDraft(@RequestBody Construction construction) {
        construction.setConstructionStatus("Draft");
        Construction saved = constructionService.saveConstruction(construction);
        return ResponseEntity.ok(ApiResponse.success("Lưu nháp thành công", saved));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Construction>> submitContract(@RequestBody Construction construction) {
        construction.setConstructionStatus("Submitted");
        construction.setSubmittedAt(LocalDateTime.now());
        Construction saved = constructionService.saveConstruction(construction);
        return ResponseEntity.ok(ApiResponse.success("Gửi duyệt thành công", saved));
    }

    @GetMapping("/my-contracts/{staffId}")
    public ResponseEntity<ApiResponse<List<Construction>>> getMyContracts(@PathVariable Integer staffId) {
        List<Construction> contracts = constructionService.getConstructionsByStaff(staffId);
        return ResponseEntity.ok(ApiResponse.success(contracts));
    }
}