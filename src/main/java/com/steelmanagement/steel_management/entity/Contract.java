package com.steelmanagement.steel_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Contracts")
@Data
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "contract_number", unique = true)
    private String contractNumber;

    @Column(name = "construction_id")
    private Integer constructionId;

    @ManyToOne
    @JoinColumn(name = "construction_id", insertable = false, updatable = false)
    private Construction construction;

    @Column(name = "customer_id")
    private Integer customerId;

    @ManyToOne
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    @Column(name = "contract_date")
    private LocalDate contractDate;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "contract_status")
    private String contractStatus;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "discount_percent")
    private Double discountPercent;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "vat_amount")
    private Double vatAmount;

    @Column(name = "final_amount", insertable = false, updatable = false)
    private Double finalAmount;

    @Column(name = "deposit_amount")
    private Double depositAmount;

    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "delivery_terms")
    private String deliveryTerms;

    @Column(name = "technical_requirements")
    private String technicalRequirements;

    @Column(name = "signed_by_customer")
    private Boolean signedByCustomer;

    @Column(name = "signed_by_company")
    private Boolean signedByCompany;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "notes")
    private String notes;

    // Promotion fields
    @Column(name = "PromotionID")
    private Integer promotionId;

    @Column(name = "PromotionCode")
    private String promotionCode;

    @Column(name = "PromotionDiscountAmount")
    private Double promotionDiscountAmount;

    @Column(name = "created_by")
    private Integer createdBy;

    @ManyToOne
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User creator;

    @Column(name = "approved_by")
    private Integer approvedBy;

    @ManyToOne
    @JoinColumn(name = "approved_by", insertable = false, updatable = false)
    private User approver;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ContractDetail> contractDetails;
}