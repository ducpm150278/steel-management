// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let allContracts = [];
let filteredContracts = [];
let currentStaff = [];
let currentCustomers = [];
let currentTab = 'all';
let selectedContractId = null;
let currentContractDetail = null;

// Load data khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadContracts();
    loadStaff();
    loadCustomers();
});

// Hàm gọi API
async function callApi(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Có lỗi xảy ra');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load danh sách hợp đồng
async function loadContracts() {
    const loading = document.getElementById('loading');
    const contractsList = document.getElementById('contractsList');

    loading.style.display = 'block';
    contractsList.innerHTML = '';

    try {
        // Lấy contracts từ database
        // Giả sử có API /contracts
        const response = await callApi('/contracts');
        allContracts = response.data || [];

        // Nếu chưa có API, dùng dữ liệu mẫu
        if (allContracts.length === 0) {
            allContracts = getMockContracts();
        }

        filteredContracts = [...allContracts];
        updateStats();
        renderContracts();
    } catch (error) {
        contractsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: ${error.message}</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Dữ liệu mẫu (tạm thời)
function getMockContracts() {
    return [
        {
            id: 1,
            contractNumber: 'HD-2025-001',
            constructionName: 'Công trình Nhà A',
            customerName: 'Công ty Xây dựng XYZ',
            customerPhone: '0901234567',
            staffName: 'Trần Văn B',
            staffRole: 'Staff',
            createdDate: '2025-02-20T10:30:00',
            status: 'Pending',
            totalAmount: 150000000,
            promotionCode: 'SALE20',
            promotionDiscount: 30000000,
            finalAmount: 120000000,
            products: [
                { name: 'Thép H 100x100', quantity: 50, unit: 'cây', price: 2000000 },
                { name: 'Thép hộp 50x50', quantity: 100, unit: 'cây', price: 500000 }
            ],
            notes: 'Giao hàng trong 7 ngày'
        },
        {
            id: 2,
            contractNumber: 'HD-2025-002',
            constructionName: 'Công trình Nhà B',
            customerName: 'Nguyễn Văn D',
            customerPhone: '0900000004',
            staffName: 'Lê Văn C',
            staffRole: 'Warehouse',
            createdDate: '2025-02-21T14:20:00',
            status: 'Approved',
            totalAmount: 85000000,
            promotionCode: 'FIXED200K',
            promotionDiscount: 200000,
            finalAmount: 84800000,
            products: [
                { name: 'Thép I 150x75', quantity: 30, unit: 'cây', price: 2500000 }
            ]
        },
        {
            id: 3,
            contractNumber: 'HD-2025-003',
            constructionName: 'Công trình Nhà C',
            customerName: 'Công ty ABC',
            customerPhone: '0909876543',
            staffName: 'Trần Văn B',
            staffRole: 'Staff',
            createdDate: '2025-02-22T09:15:00',
            status: 'Draft',
            totalAmount: 45000000,
            promotionCode: null,
            promotionDiscount: 0,
            finalAmount: 45000000,
            products: [
                { name: 'Thép hộp 40x40', quantity: 200, unit: 'cây', price: 225000 }
            ]
        }
    ];
}

// Load danh sách nhân viên
async function loadStaff() {
    try {
        const response = await callApi('/users/role/Staff');
        currentStaff = response.data || [];

        const staffFilter = document.getElementById('staffFilter');
        currentStaff.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;
            option.textContent = staff.fullName;
            staffFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

// Load danh sách khách hàng
async function loadCustomers() {
    try {
        const response = await callApi('/customers');
        currentCustomers = response.data || [];

        const customerFilter = document.getElementById('customerFilter');
        currentCustomers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.fullName;
            customerFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Cập nhật thống kê
function updateStats() {
    const total = allContracts.length;
    const pending = allContracts.filter(c => c.status === 'Pending').length;
    const approved = allContracts.filter(c => c.status === 'Approved').length;
    const rejected = allContracts.filter(c => c.status === 'Rejected').length;
    const draft = allContracts.filter(c => c.status === 'Draft').length;
    const totalValue = allContracts.reduce((sum, c) => sum + (c.finalAmount || 0), 0);

    document.getElementById('totalContracts').textContent = total;
    document.getElementById('pendingContracts').textContent = pending;
    document.getElementById('approvedContracts').textContent = approved;
    document.getElementById('totalValue').textContent = formatCurrency(totalValue);

    document.getElementById('allCount').textContent = total;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('rejectedCount').textContent = rejected;
    document.getElementById('draftCount').textContent = draft;
}

// Render danh sách hợp đồng
function renderContracts() {
    const contractsList = document.getElementById('contractsList');

    if (filteredContracts.length === 0) {
        contractsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-contract"></i>
                <p>Không có hợp đồng nào</p>
            </div>
        `;
        return;
    }

    let html = '';
    filteredContracts.forEach(contract => {
        const statusClass = getStatusClass(contract.status);
        const statusText = getStatusText(contract.status);

        html += `
            <div class="contract-card ${getStatusClass(contract.status)}">
                <div class="contract-header">
                    <div class="contract-title">
                        <span class="contract-code">${contract.contractNumber}</span>
                        <span class="contract-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="contract-date">
                        <i class="far fa-calendar-alt"></i>
                        ${formatDate(contract.createdDate)}
                    </div>
                </div>
                
                <div class="contract-body">
                    <div class="contract-info-item">
                        <span class="info-label">Công trình</span>
                        <span class="info-value">${contract.constructionName}</span>
                    </div>
                    <div class="contract-info-item">
                        <span class="info-label">Khách hàng</span>
                        <span class="info-value">${contract.customerName}</span>
                        <small>${contract.customerPhone}</small>
                    </div>
                    <div class="contract-info-item">
                        <span class="info-label">Tổng giá trị</span>
                        <span class="info-value large">${formatCurrency(contract.totalAmount)}</span>
                    </div>
                    <div class="contract-info-item">
                        <span class="info-label">Thành tiền</span>
                        <span class="info-value large" style="color: #28a745;">${formatCurrency(contract.finalAmount)}</span>
                    </div>
                </div>
                
                <div class="contract-products">
                    <div class="products-title">
                        <i class="fas fa-box"></i>
                        Sản phẩm (${contract.products.length})
                    </div>
                    ${contract.products.slice(0, 2).map(p => `
                        <div class="product-item">
                            <span class="product-name">${p.name}</span>
                            <span class="product-quantity">${p.quantity} ${p.unit}</span>
                        </div>
                    `).join('')}
                    ${contract.products.length > 2 ? `
                        <div class="product-item">
                            <span class="product-name">...</span>
                            <span class="product-quantity">+${contract.products.length - 2} sản phẩm khác</span>
                        </div>
                    ` : ''}
                </div>
                
                ${contract.promotionCode ? `
                    <div class="promotion-badge" style="margin-bottom: 15px;">
                        <i class="fas fa-tag"></i>
                        KM: ${contract.promotionCode} (-${formatCurrency(contract.promotionDiscount)})
                    </div>
                ` : ''}
                
                <div class="contract-footer">
                    <div class="staff-info">
                        <div class="staff-avatar">${getInitials(contract.staffName)}</div>
                        <div class="staff-details">
                            <div class="staff-name">${contract.staffName}</div>
                            <div class="staff-role">${contract.staffRole}</div>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn-view-detail" onclick="viewContractDetail(${contract.id})">
                            <i class="fas fa-eye"></i>
                            Xem chi tiết
                        </button>
                        ${contract.status === 'Pending' ? `
                            <button class="btn-approve" onclick="approveContract(${contract.id})">
                                <i class="fas fa-check"></i>
                                Duyệt
                            </button>
                            <button class="btn-reject" onclick="showRejectModal(${contract.id})">
                                <i class="fas fa-times"></i>
                                Từ chối
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    contractsList.innerHTML = html;
}

// Xem chi tiết hợp đồng
async function viewContractDetail(contractId) {
    const contract = filteredContracts.find(c => c.id === contractId);
    if (!contract) return;

    selectedContractId = contractId;
    currentContractDetail = contract;

    const modalBody = document.getElementById('contractDetailBody');
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');

    // Hiển thị nếu contract đang chờ duyệt
    if (contract.status === 'Pending') {
        approveBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
    } else {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
    }

    let productsHtml = '';
    contract.products.forEach(p => {
        productsHtml += `
            <tr>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>${p.unit}</td>
                <td>${formatCurrency(p.price)}</td>
                <td>${formatCurrency(p.quantity * p.price)}</td>
            </tr>
        `;
    });

    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Thông tin hợp đồng</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; background: #f8f9fa; width: 150px;"><strong>Số hợp đồng:</strong></td>
                    <td style="padding: 8px;">${contract.contractNumber}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f8f9fa;"><strong>Công trình:</strong></td>
                    <td style="padding: 8px;">${contract.constructionName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f8f9fa;"><strong>Khách hàng:</strong></td>
                    <td style="padding: 8px;">${contract.customerName} - ${contract.customerPhone}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f8f9fa;"><strong>Nhân viên tạo:</strong></td>
                    <td style="padding: 8px;">${contract.staffName} (${contract.staffRole})</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f8f9fa;"><strong>Ngày tạo:</strong></td>
                    <td style="padding: 8px;">${formatDate(contract.createdDate, true)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f8f9fa;"><strong>Trạng thái:</strong></td>
                    <td style="padding: 8px;">
                        <span class="contract-status ${getStatusClass(contract.status)}">${getStatusText(contract.status)}</span>
                    </td>
                </tr>
            </table>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Chi tiết sản phẩm</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #ffd700; color: #1e2b3a;">
                        <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                        <th style="padding: 10px; text-align: right;">Số lượng</th>
                        <th style="padding: 10px; text-align: left;">Đơn vị</th>
                        <th style="padding: 10px; text-align: right;">Đơn giá</th>
                        <th style="padding: 10px; text-align: right;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHtml}
                </tbody>
                <tfoot>
                    <tr style="border-top: 2px solid #dee2e6;">
                        <td colspan="4" style="padding: 10px; text-align: right;"><strong>Tổng cộng:</strong></td>
                        <td style="padding: 10px; text-align: right;"><strong>${formatCurrency(contract.totalAmount)}</strong></td>
                    </tr>
                    ${contract.promotionCode ? `
                        <tr>
                            <td colspan="4" style="padding: 10px; text-align: right;">Khuyến mãi (${contract.promotionCode}):</td>
                            <td style="padding: 10px; text-align: right; color: #dc3545;">-${formatCurrency(contract.promotionDiscount)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" style="padding: 10px; text-align: right;"><strong>Thành tiền:</strong></td>
                            <td style="padding: 10px; text-align: right;"><strong style="color: #28a745;">${formatCurrency(contract.finalAmount)}</strong></td>
                        </tr>
                    ` : ''}
                </tfoot>
            </table>
        </div>
        
        ${contract.notes ? `
            <div>
                <h3 style="margin-bottom: 15px; color: #2c3e50;">Ghi chú</h3>
                <p style="padding: 10px; background: #f8f9fa; border-radius: 6px;">${contract.notes}</p>
            </div>
        ` : ''}
    `;

    document.getElementById('contractDetailModal').style.display = 'block';
}

// Phê duyệt hợp đồng
async function approveContract(contractId) {
    const id = contractId || selectedContractId;
    if (!id) return;

    if (!confirm('Bạn có chắc muốn phê duyệt hợp đồng này?')) return;

    try {
        // Gọi API approve contract
        // await callApi(`/contracts/${id}/approve`, 'PUT');

        // Cập nhật UI
        const contract = allContracts.find(c => c.id === id);
        if (contract) {
            contract.status = 'Approved';
            filteredContracts = [...allContracts];
            applyFilters();
            closeDetailModal();
            alert('Phê duyệt hợp đồng thành công!');
        }
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Hiển thị modal từ chối
function showRejectModal(contractId) {
    selectedContractId = contractId || selectedContractId;
    document.getElementById('rejectModal').style.display = 'block';
}

// Xác nhận từ chối
async function confirmReject() {
    const reason = document.getElementById('rejectReason').value.trim();
    if (!reason) {
        alert('Vui lòng nhập lý do từ chối!');
        return;
    }

    try {
        // Gọi API reject contract
        // await callApi(`/contracts/${selectedContractId}/reject`, 'PUT', { reason });

        // Cập nhật UI
        const contract = allContracts.find(c => c.id === selectedContractId);
        if (contract) {
            contract.status = 'Rejected';
            contract.rejectReason = reason;
            filteredContracts = [...allContracts];
            applyFilters();
            closeRejectModal();
            closeDetailModal();
            alert('Đã từ chối hợp đồng!');
        }
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Chuyển tab
function switchTab(tab) {
    currentTab = tab;

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    applyFilters();
}

// Áp dụng bộ lọc
function applyFilters() {
    const searchTerm = document.getElementById('searchContract').value.toLowerCase();
    const staffId = document.getElementById('staffFilter').value;
    const customerId = document.getElementById('customerFilter').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    filteredContracts = allContracts.filter(contract => {
        // Lọc theo tab
        if (currentTab !== 'all' && contract.status.toLowerCase() !== currentTab) {
            return false;
        }

        // Lọc theo search
        if (searchTerm && !contract.contractNumber.toLowerCase().includes(searchTerm) &&
            !contract.customerName.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Lọc theo staff
        if (staffId !== 'all' && contract.staffId != staffId) {
            return false;
        }

        // Lọc theo customer
        if (customerId !== 'all' && contract.customerId != customerId) {
            return false;
        }

        // Lọc theo ngày
        if (fromDate && new Date(contract.createdDate) < new Date(fromDate)) {
            return false;
        }
        if (toDate && new Date(contract.createdDate) > new Date(toDate)) {
            return false;
        }

        return true;
    });

    renderContracts();
}

// Helper functions
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'pending': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        case 'draft': return 'status-draft';
        default: return '';
    }
}

function getStatusText(status) {
    switch(status.toLowerCase()) {
        case 'pending': return 'Chờ duyệt';
        case 'approved': return 'Đã duyệt';
        case 'rejected': return 'Từ chối';
        case 'draft': return 'Bản nháp';
        default: return status;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString, includeTime = false) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (includeTime) {
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
    }
    return date.toLocaleDateString('vi-VN');
}

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
}

// Modal functions
function closeDetailModal() {
    document.getElementById('contractDetailModal').style.display = 'none';
}

function closeRejectModal() {
    document.getElementById('rejectModal').style.display = 'none';
    document.getElementById('rejectReason').value = '';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const detailModal = document.getElementById('contractDetailModal');
    const rejectModal = document.getElementById('rejectModal');

    if (event.target === detailModal) {
        closeDetailModal();
    }
    if (event.target === rejectModal) {
        closeRejectModal();
    }
}

// Debounce search
let searchTimeout;
document.getElementById('searchContract').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 300);
});