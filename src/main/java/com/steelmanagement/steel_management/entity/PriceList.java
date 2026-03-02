package com.steelmanagement.steel_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PriceLists")
@Data
public class PriceList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_id")
    private Integer productId;

    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(name = "price_type")
    private String priceType;

    @Column(name = "customer_type")
    private String customerType;

    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "unit_price")
    private Double unitPrice;

    @Column(name = "sale_price")
    private Double salePrice;

    @Column(name = "currency")
    private String currency;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "min_quantity")
    private Double minQuantity;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}