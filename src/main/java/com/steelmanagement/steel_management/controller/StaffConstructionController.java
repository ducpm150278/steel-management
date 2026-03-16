package com.steelmanagement.steel_management.controller;

import com.steelmanagement.steel_management.dto.ApiResponse;
import com.steelmanagement.steel_management.dto.ConstructionDTO;
import com.steelmanagement.steel_management.dto.ConstructionDetailDTO;
import com.steelmanagement.steel_management.entity.Construction;
import com.steelmanagement.steel_management.service.ConstructionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/staff/constructions")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffConstructionController {

    @Autowired
    private ConstructionService constructionService;

    @GetMapping("/{staffId}")
    public ResponseEntity<ApiResponse<List<ConstructionDTO>>> getConstructionsByStaff(@PathVariable Integer staffId) {
        List<ConstructionDTO> constructions = constructionService.getConstructionsByStaff(staffId);
        return ResponseEntity.ok(ApiResponse.success(constructions));
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<ConstructionDetailDTO>> getConstructionDetail(@PathVariable Integer id) {
        ConstructionDetailDTO detail = constructionService.getConstructionDetailById(id);
        if (detail != null) {
            return ResponseEntity.ok(ApiResponse.success(detail));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Construction>> createConstruction(@RequestBody Construction construction) {
        construction.setConstructionStatus("Draft");
        construction.setCreatedAt(LocalDateTime.now());
        Construction saved = constructionService.saveConstruction(construction);
        return ResponseEntity.ok(ApiResponse.success("Thêm công trình thành công", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Construction>> updateConstruction(@PathVariable Integer id, @RequestBody Construction construction) {
        construction.setId(id);
        construction.setUpdatedAt(LocalDateTime.now());
        Construction updated = constructionService.saveConstruction(construction);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật công trình thành công", updated));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<Construction>> submitConstruction(@PathVariable Integer id) {
        Construction updated = constructionService.submitConstruction(id);
        if (updated != null) {
            return ResponseEntity.ok(ApiResponse.success("Gửi duyệt công trình thành công", updated));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteConstruction(@PathVariable Integer id) {
        constructionService.deleteConstruction(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa công trình thành công", null));
    }
}