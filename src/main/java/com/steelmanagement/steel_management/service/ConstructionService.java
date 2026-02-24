package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.entity.Construction;
import com.steelmanagement.steel_management.repository.ConstructionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ConstructionService {

    @Autowired
    private ConstructionRepository constructionRepository;

    public Construction saveConstruction(Construction construction) {
        return constructionRepository.save(construction);
    }

    public List<Construction> getConstructionsByStaff(Integer staffId) {
        // Giả sử Construction có trường created_by để lọc theo staff
        // Nếu không có trường này, bạn cần thêm vào entity Construction
        return constructionRepository.findByCreatedBy(staffId);
    }

    public Construction getConstructionById(Integer id) {
        return constructionRepository.findById(id).orElse(null);
    }

    public List<Construction> getAllConstructions() {
        return constructionRepository.findAll();
    }

    public List<Construction> getConstructionsByStatus(String status) {
        return constructionRepository.findByConstructionStatus(status);
    }

    public void deleteConstruction(Integer id) {
        constructionRepository.deleteById(id);
    }
}