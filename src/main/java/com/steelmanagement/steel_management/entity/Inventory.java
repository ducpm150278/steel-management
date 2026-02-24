package com.steelmanagement.steel_management.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Inventory")
@Data
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_id")
    private Integer productId;

    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @Column(name = "warehouse_location")
    private String warehouseLocation;

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "quantity")
    private Double quantity;

    @Column(name = "unit")
    private String unit;

    @Column(name = "reserved_quantity")
    private Double reservedQuantity;

    @Column(name = "min_stock_level")
    private Double minStockLevel;

    @Column(name = "last_updated_by")
    private Integer lastUpdatedBy;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}