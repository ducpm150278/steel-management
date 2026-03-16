package com.steelmanagement.steel_management.repository;

import com.steelmanagement.steel_management.entity.PriceList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceListRepository extends JpaRepository<PriceList, Integer> {

    @Query("SELECT pl FROM PriceList pl WHERE pl.productId = :productId " +
            "AND pl.priceType = 'retail' " +
            "AND pl.effectiveFrom <= CURRENT_DATE " +
            "AND (pl.effectiveTo IS NULL OR pl.effectiveTo >= CURRENT_DATE)")
    Optional<PriceList> findCurrentRetailPrice(@Param("productId") Integer productId);

    @Query("SELECT pl FROM PriceList pl WHERE pl.productId = :productId " +
            "AND pl.priceType = 'wholesale' " +
            "AND pl.effectiveFrom <= CURRENT_DATE " +
            "AND (pl.effectiveTo IS NULL OR pl.effectiveTo >= CURRENT_DATE)")
    Optional<PriceList> findCurrentWholesalePrice(@Param("productId") Integer productId);

    @Query("SELECT pl FROM PriceList pl WHERE pl.productId = :productId " +
            "AND pl.priceType = :priceType " +
            "AND pl.effectiveFrom <= CURRENT_DATE " +
            "AND (pl.effectiveTo IS NULL OR pl.effectiveTo >= CURRENT_DATE)")
    Optional<PriceList> findCurrentPrice(@Param("productId") Integer productId, @Param("priceType") String priceType);

    @Query("SELECT pl FROM PriceList pl WHERE pl.productId = :productId " +
            "AND pl.customerId = :customerId " +
            "AND pl.effectiveFrom <= CURRENT_DATE " +
            "AND (pl.effectiveTo IS NULL OR pl.effectiveTo >= CURRENT_DATE)")
    Optional<PriceList> findPriceForCustomer(@Param("productId") Integer productId, @Param("customerId") Integer customerId);

    @Query("SELECT pl FROM PriceList pl WHERE pl.productId = :productId " +
            "AND pl.customerType = :customerType " +
            "AND pl.effectiveFrom <= CURRENT_DATE " +
            "AND (pl.effectiveTo IS NULL OR pl.effectiveTo >= CURRENT_DATE)")
    Optional<PriceList> findPriceByCustomerType(@Param("productId") Integer productId, @Param("customerType") String customerType);

    @Query("SELECT pl FROM PriceList pl WHERE pl.productId = :productId " +
            "AND pl.effectiveFrom <= CURRENT_DATE " +
            "AND (pl.effectiveTo IS NULL OR pl.effectiveTo >= CURRENT_DATE)")
    List<PriceList> findAllCurrentPrices(@Param("productId") Integer productId);
}