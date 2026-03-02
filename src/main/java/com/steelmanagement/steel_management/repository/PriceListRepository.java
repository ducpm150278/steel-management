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

    // Lấy giá bán lẻ hiện tại của sản phẩm
    @Query("SELECT pl FROM PriceList pl WHERE pl.productId = :productId AND pl.priceType = 'retail' AND pl.effectiveFrom <= CURRENT_DATE AND (pl.effectiveTo IS NULL OR pl.effectiveTo >= CURRENT_DATE)")
    Optional<PriceList> findCurrentRetailPrice(@Param("productId") Integer productId);

    // Lấy giá bán buôn hiện tại của sản phẩm
    @Query("SELECT pl FROM PriceList pl WHERE pl.productId = :productId AND pl.priceType = 'wholesale' AND pl.effectiveFrom <= CURRENT_DATE AND (pl.effectiveTo IS NULL OR pl.effectiveTo >= CURRENT_DATE)")
    Optional<PriceList> findCurrentWholesalePrice(@Param("productId") Integer productId);

    // Lấy tất cả giá của sản phẩm
    List<PriceList> findByProductId(Integer productId);

    // Lấy giá theo loại
    List<PriceList> findByProductIdAndPriceType(Integer productId, String priceType);
}