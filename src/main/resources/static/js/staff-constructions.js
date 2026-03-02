// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let allConstructions = [];
let filteredConstructions = [];
let customers = [];
let currentPage = 1;
let itemsPerPage = 9; // 3x3 grid
let currentStaffId = 2; // Giả sử staff đang đăng nhập có id = 2 (Trần Văn B)
let currentViewConstruction = null;

// Load data khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    loadConstructions();
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

// Load danh sách khách hàng
async function loadCustomers() {
    try {
        const response = await callApi('/customers');
        customers = response.data || [];

        const customerFilter = document.getElementById('customerFilter');
        const customerSelect = document.getElementById('customerSelect');

        // Clear existing options
        customerFilter.innerHTML = '<option value="all">Tất cả khách hàng</option>';
        customerSelect.innerHTML = '';

        customers.forEach(customer => {
            // Thêm vào filter
            const filterOption = document.createElement('option');
            filterOption.value = customer.id;
            filterOption.textContent = customer.fullName;
            customerFilter.appendChild(filterOption);

            // Thêm vào select trong modal
            const selectDiv = document.createElement('div');
            selectDiv.className = 'customer-option';
            selectDiv.setAttribute('data-id', customer.id);
            selectDiv.setAttribute('onclick', 'selectCustomer(this)');
            selectDiv.innerHTML = `
                <strong>${customer.fullName}</strong><br>
                <small>${customer.phone || 'Chưa có SĐT'} | ${customer.email || 'Không có email'}</small>
            `;
            customerSelect.appendChild(selectDiv);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Chọn khách hàng trong modal
function selectCustomer(element) {
    // Remove selected class from all
    document.querySelectorAll('.customer-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Add selected class to clicked element
    element.classList.add('selected');
}

// Lấy ID khách hàng được chọn
function getSelectedCustomerId() {
    const selected = document.querySelector('.customer-option.selected');
    return selected ? selected.getAttribute('data-id') : null;
}

// Load danh sách công trình
async function loadConstructions() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('constructionsGrid');
    const pagination = document.getElementById('pagination');

    loading.style.display = 'block';
    grid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải dữ liệu...</p>
        </div>
    `;

    try {
        const response = await callApi(`/staff/constructions/${currentStaffId}`);
        allConstructions = response.data || [];

        filteredConstructions = [...allConstructions];
        updateStats();
        displayConstructions();

        if (allConstructions.length > 0) {
            pagination.style.display = 'flex';
        } else {
            pagination.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading constructions:', error);
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: ${error.message}</p>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Cập nhật thống kê
function updateStats() {
    const total = allConstructions.length;
    const pending = allConstructions.filter(c => c.constructionStatus === 'Submitted').length;
    const accepted = allConstructions.filter(c => c.constructionStatus === 'Accepted').length;
    const rejected = allConstructions.filter(c => c.constructionStatus === 'Rejected').length;

    document.getElementById('totalConstructions').textContent = total;
    document.getElementById('pendingConstructions').textContent = pending;
    document.getElementById('acceptedConstructions').textContent = accepted;
    document.getElementById('rejectedConstructions').textContent = rejected;
}

// Hiển thị công trình
function displayConstructions() {
    const grid = document.getElementById('constructionsGrid');
    const pagination = document.getElementById('pagination');

    if (filteredConstructions.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-building"></i>
                <p>Không có công trình nào</p>
            </div>
        `;
        pagination.style.display = 'none';
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredConstructions.length);
    const paginatedConstructions = filteredConstructions.slice(start, end);

    let html = '';
    paginatedConstructions.forEach(construction => {
        const statusClass = getStatusClass(construction.constructionStatus);
        const statusText = getStatusText(construction.constructionStatus);
        const canSubmit = construction.constructionStatus === 'Draft';

        html += `
            <div class="construction-card">
                <div class="card-header">
                    <h3>${construction.constructionName || 'Chưa có tên'}</h3>
                    <div class="construction-code">Mã: ${construction.constructionCode || 'Chưa có mã'}</div>
                </div>
                <div class="card-body">
                    <div class="info-row">
                        <span class="info-label">Khách hàng:</span>
                        <span class="info-value">${construction.customerName || 'Đang cập nhật'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">SĐT:</span>
                        <span class="info-value">${construction.customerPhone || 'Đang cập nhật'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ngày tạo:</span>
                        <span class="info-value">${formatDate(construction.createdAt)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái:</span>
                        <span class="info-value">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </span>
                    </div>
                </div>
                <div class="card-footer">
                    <div>
                        <button class="btn-icon btn-view" onclick="viewConstruction(${construction.id})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editConstruction(${construction.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    ${canSubmit ? `
                        <button class="btn-icon btn-submit" onclick="submitConstruction(${construction.id})" title="Gửi duyệt">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
    updatePaginationInfo(start + 1, end, filteredConstructions.length);
    renderPaginationButtons();
}

// Helper functions
function getStatusClass(status) {
    switch(status) {
        case 'Draft': return 'status-draft';
        case 'Submitted': return 'status-submitted';
        case 'Accepted': return 'status-accepted';
        case 'Rejected': return 'status-rejected';
        default: return 'status-draft';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'Draft': return 'Bản nháp';
        case 'Submitted': return 'Chờ duyệt';
        case 'Accepted': return 'Đã duyệt';
        case 'Rejected': return 'Từ chối';
        default: return status || 'Không xác định';
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
}

// Pagination functions
function updatePaginationInfo(start, end, total) {
    document.getElementById('paginationInfo').textContent =
        `Hiển thị ${start}-${end} của ${total} công trình`;
}

function renderPaginationButtons() {
    const totalPages = Math.ceil(filteredConstructions.length / itemsPerPage);
    const controls = document.getElementById('paginationControls');

    let html = `
        <button class="page-btn" onclick="changePage('prev')" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<button class="page-btn" disabled>...</button>`;
        }
    }

    html += `
        <button class="page-btn" onclick="changePage('next')" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    controls.innerHTML = html;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredConstructions.length / itemsPerPage);
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    displayConstructions();
}

function goToPage(page) {
    currentPage = page;
    displayConstructions();
}

// Filter functions
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const customerFilter = document.getElementById('customerFilter').value;

    filteredConstructions = allConstructions.filter(construction => {
        if (statusFilter !== 'all' && construction.constructionStatus !== statusFilter) {
            return false;
        }
        if (customerFilter !== 'all' && construction.customerId != customerFilter) {
            return false;
        }
        return true;
    });

    currentPage = 1;
    displayConstructions();
}

// Search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = this.value.toLowerCase();

        filteredConstructions = allConstructions.filter(construction =>
            (construction.constructionName && construction.constructionName.toLowerCase().includes(searchTerm)) ||
            (construction.constructionCode && construction.constructionCode.toLowerCase().includes(searchTerm)) ||
            (construction.customerName && construction.customerName.toLowerCase().includes(searchTerm))
        );

        currentPage = 1;
        displayConstructions();
    }, 300);
});

// Modal functions
function showAddConstructionModal() {
    document.getElementById('modalTitle').textContent = 'Thêm công trình mới';
    document.getElementById('constructionForm').reset();
    document.getElementById('constructionId').value = '';

    // Remove selected class from all customer options
    document.querySelectorAll('.customer-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    document.getElementById('constructionModal').style.display = 'block';
}

async function editConstruction(id) {
    try {
        const response = await callApi(`/staff/constructions/detail/${id}`);
        const construction = response.data;

        document.getElementById('modalTitle').textContent = 'Chỉnh sửa công trình';
        document.getElementById('constructionId').value = construction.id;
        document.getElementById('constructionCode').value = construction.constructionCode || '';
        document.getElementById('constructionName').value = construction.constructionName || '';
        document.getElementById('description').value = construction.description || '';
        document.getElementById('notes').value = construction.notes || '';

        // Select the customer
        document.querySelectorAll('.customer-option').forEach(opt => {
            if (opt.getAttribute('data-id') == construction.customerId) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });

        document.getElementById('constructionModal').style.display = 'block';
    } catch (error) {
        alert('Lỗi khi tải thông tin công trình: ' + error.message);
    }
}

function closeModal() {
    document.getElementById('constructionModal').style.display = 'none';
}

// Save construction
async function saveConstruction() {
    const constructionId = document.getElementById('constructionId').value;
    const customerId = getSelectedCustomerId();

    if (!customerId) {
        alert('Vui lòng chọn khách hàng!');
        return;
    }
    if (!document.getElementById('constructionCode').value.trim()) {
        alert('Vui lòng nhập mã công trình!');
        return;
    }
    if (!document.getElementById('constructionName').value.trim()) {
        alert('Vui lòng nhập tên công trình!');
        return;
    }

    const constructionData = {
        constructionCode: document.getElementById('constructionCode').value.trim(),
        constructionName: document.getElementById('constructionName').value.trim(),
        customerId: parseInt(customerId),
        description: document.getElementById('description').value.trim(),
        notes: document.getElementById('notes').value.trim(),
        createdBy: currentStaffId
    };

    // Only set status for new constructions
    if (!constructionId) {
        constructionData.constructionStatus = 'Draft';
    }

    try {
        if (constructionId) {
            await callApi(`/staff/constructions/${constructionId}`, 'PUT', constructionData);
            alert('Cập nhật công trình thành công!');
        } else {
            await callApi('/staff/constructions', 'POST', constructionData);
            alert('Thêm công trình thành công!');
        }

        closeModal();
        loadConstructions();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// View construction
function viewConstruction(id) {
    const construction = allConstructions.find(c => c.id === id);
    if (!construction) return;

    currentViewConstruction = construction;

    const modalBody = document.getElementById('viewConstructionBody');
    const submitBtn = document.getElementById('submitBtn');

    // Show submit button if status is Draft
    if (construction.constructionStatus === 'Draft') {
        submitBtn.style.display = 'inline-block';
    } else {
        submitBtn.style.display = 'none';
    }

    modalBody.innerHTML = `
        <div class="detail-view">
            <div class="detail-section">
                <h3>Thông tin chung</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">Mã công trình</span>
                        <span class="value">${construction.constructionCode || 'Chưa có'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Tên công trình</span>
                        <span class="value">${construction.constructionName || 'Chưa có'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Trạng thái</span>
                        <span class="value">
                            <span class="status-badge ${getStatusClass(construction.constructionStatus)}">
                                ${getStatusText(construction.constructionStatus)}
                            </span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Ngày tạo</span>
                        <span class="value">${formatDateTime(construction.createdAt)}</span>
                    </div>
                    ${construction.submittedAt ? `
                        <div class="detail-item">
                            <span class="label">Ngày gửi duyệt</span>
                            <span class="value">${formatDateTime(construction.submittedAt)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">Tên khách hàng</span>
                        <span class="value">${construction.customerName || 'Đang cập nhật'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Số điện thoại</span>
                        <span class="value">${construction.customerPhone || 'Đang cập nhật'}</span>
                    </div>
                </div>
            </div>

            ${construction.description ? `
                <div class="detail-section">
                    <h3>Mô tả</h3>
                    <p style="background: #f8f9fa; padding: 10px; border-radius: 6px;">${construction.description}</p>
                </div>
            ` : ''}

            ${construction.notes ? `
                <div class="detail-section">
                    <h3>Ghi chú</h3>
                    <p style="background: #f8f9fa; padding: 10px; border-radius: 6px;">${construction.notes}</p>
                </div>
            ` : ''}
            
            ${construction.promotionCode ? `
                <div class="detail-section">
                    <h3>Khuyến mãi áp dụng</h3>
                    <p style="background: #fff3cd; padding: 10px; border-radius: 6px;">
                        <i class="fas fa-tag"></i>
                        Mã: ${construction.promotionCode} - Giảm: ${formatCurrency(construction.promotionDiscountAmount || 0)}
                    </p>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('viewConstructionModal').style.display = 'block';
}

function closeViewModal() {
    document.getElementById('viewConstructionModal').style.display = 'none';
}

function editFromView() {
    closeViewModal();
    if (currentViewConstruction) {
        editConstruction(currentViewConstruction.id);
    }
}

// Submit for approval
async function submitConstruction(id) {
    if (!confirm('Bạn có chắc muốn gửi công trình này để duyệt?')) return;

    try {
        await callApi(`/staff/constructions/${id}/submit`, 'PUT');
        alert('Đã gửi duyệt công trình thành công!');
        loadConstructions();
        closeViewModal();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

function submitForApproval() {
    if (currentViewConstruction) {
        submitConstruction(currentViewConstruction.id);
    }
}

// Format currency
function formatCurrency(amount) {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const constructionModal = document.getElementById('constructionModal');
    const viewModal = document.getElementById('viewConstructionModal');

    if (event.target === constructionModal) closeModal();
    if (event.target === viewModal) closeViewModal();
};