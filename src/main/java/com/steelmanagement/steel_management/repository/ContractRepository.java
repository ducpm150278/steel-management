package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {

    List<Contract> findByContractStatus(String status);

    List<Contract> findByCreatedBy(Integer staffId);

    List<Contract> findByCustomerId(Integer customerId);

    @Query("SELECT c FROM Contract c WHERE c.contractStatus = :status AND c.createdBy = :staffId")
    List<Contract> findByStatusAndStaff(@Param("status") String status, @Param("staffId") Integer staffId);

    @Query("SELECT c FROM Contract c ORDER BY c.createdAt DESC")
    List<Contract> findAllOrderByCreatedAtDesc();
}