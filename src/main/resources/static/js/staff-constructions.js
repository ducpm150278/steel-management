// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let allConstructions = [];
let filteredConstructions = [];
let customers = [];
let currentPage = 1;
let itemsPerPage = 9;
let currentViewConstruction = null;
let currentEditId = null;

// Load data khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    loadAllConstructions();
});

// =============================================
// API CALL FUNCTION
// =============================================

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
        console.log(`Calling API: ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// =============================================
// CUSTOMER FUNCTIONS
// =============================================

async function loadCustomers() {
    try {
        console.log('Loading customers...');
        const response = await callApi('/customers');
        console.log('Customers response:', response);

        if (response.data && response.data.length > 0) {
            customers = response.data;
            displayCustomers(customers);
        } else {
            console.error('No customers data from API');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function displayCustomers(customers) {
    const customerFilter = document.getElementById('customerFilter');
    const customerSelect = document.getElementById('customerSelect');

    // Clear existing options
    if (customerFilter) {
        customerFilter.innerHTML = '<option value="all">Tất cả khách hàng</option>';
    }

    if (customerSelect) {
        customerSelect.innerHTML = '';
    }

    customers.forEach(customer => {
        // Thêm vào filter
        if (customerFilter) {
            const filterOption = document.createElement('option');
            filterOption.value = customer.id;
            filterOption.textContent = customer.fullName;
            customerFilter.appendChild(filterOption);
        }

        // Thêm vào select trong modal
        if (customerSelect) {
            const selectDiv = document.createElement('div');
            selectDiv.className = 'customer-option';
            selectDiv.setAttribute('data-id', customer.id);
            selectDiv.setAttribute('onclick', 'selectCustomer(this)');
            selectDiv.innerHTML = `
                <strong>${customer.fullName}</strong><br>
                <small>${customer.phone || 'Chưa có SĐT'} | ${customer.email || 'Không có email'}</small>
            `;
            customerSelect.appendChild(selectDiv);
        }
    });
}

function selectCustomer(element) {
    document.querySelectorAll('.customer-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
}

function getSelectedCustomerId() {
    const selected = document.querySelector('.customer-option.selected');
    return selected ? selected.getAttribute('data-id') : null;
}

// =============================================
// LOAD ALL CONSTRUCTIONS (KHÔNG GIỚI HẠN ID)
// =============================================

async function loadAllConstructions() {
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
        console.log('Loading all constructions...');
        // Gọi API lấy tất cả công trình (không giới hạn staff)
        const response = await callApi('/constructions/all');
        console.log('Constructions response:', response);

        if (response.data && response.data.length > 0) {
            allConstructions = response.data;
        } else {
            allConstructions = [];
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <p>Không có công trình nào</p>
                </div>
            `;
        }

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

// =============================================
// UPDATE STATS
// =============================================

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

// =============================================
// DISPLAY CONSTRUCTIONS
// =============================================

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
                        <span class="info-label">Số sản phẩm:</span>
                        <span class="info-value">${construction.itemCount || 0}</span>
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

// =============================================
// VIEW CONSTRUCTION DETAILS
// =============================================

async function viewConstruction(id) {
    try {
        console.log(`Loading construction details for ID: ${id}`);

        const response = await callApi(`/constructions/detail/${id}`);
        const construction = response.data;

        if (!construction) {
            alert('Không tìm thấy công trình!');
            return;
        }

        currentViewConstruction = construction;

        const modalBody = document.getElementById('viewConstructionBody');
        const submitBtn = document.getElementById('submitBtn');

        // Show submit button if status is Draft
        if (construction.constructionStatus === 'Draft') {
            submitBtn.style.display = 'inline-block';
        } else {
            submitBtn.style.display = 'none';
        }

        // Tính tổng giá trị
        let totalValue = 0;
        if (construction.items && construction.items.length > 0) {
            totalValue = construction.items.reduce((sum, item) => sum + (item.total || item.quantity * item.price), 0);
        }

        // Tạo HTML cho danh sách sản phẩm
        let itemsHtml = '';

        if (construction.items && construction.items.length > 0) {
            itemsHtml = construction.items.map(item => {
                const itemTotal = item.total || (item.quantity * item.price);
                return `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e9ecef;">${item.productName || 'Sản phẩm #' + item.productId}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.unit || 'cây'}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(item.price)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(itemTotal)}</td>
                    </tr>
                `;
            }).join('');
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
                        <div class="detail-item">
                            <span class="label">Người tạo (Staff)</span>
                            <span class="value">${construction.createdByName || 'Staff #' + construction.createdBy}</span>
                        </div>
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

                <div class="detail-section">
                    <h3>Chi tiết sản phẩm</h3>
                    ${itemsHtml ? `
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #ffd700;">
                                    <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                                    <th style="padding: 10px; text-align: center;">Số lượng</th>
                                    <th style="padding: 10px; text-align: center;">Đơn vị</th>
                                    <th style="padding: 10px; text-align: right;">Đơn giá</th>
                                    <th style="padding: 10px; text-align: right;">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                            <tfoot>
                                <tr style="background: #f8f9fa; font-weight: 600;">
                                    <td colspan="4" style="padding: 10px; text-align: right;">Tổng cộng:</td>
                                    <td style="padding: 10px; text-align: right;">${formatCurrency(totalValue)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    ` : '<p style="padding: 20px; text-align: center; color: #6c757d;">Không có sản phẩm nào</p>'}
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
    } catch (error) {
        console.error('Error loading construction details:', error);
        alert('Lỗi khi tải chi tiết công trình: ' + error.message);
    }
}

// =============================================
// EDIT CONSTRUCTION
// =============================================

async function editConstruction(id) {
    try {
        console.log(`Loading construction for edit: ${id}`);
        currentEditId = id;

        const response = await callApi(`/constructions/detail/${id}`);
        const construction = response.data;

        if (!construction) {
            alert('Không tìm thấy công trình!');
            return;
        }

        document.getElementById('modalTitle').textContent = 'Chỉnh sửa công trình';
        document.getElementById('constructionId').value = construction.id;

        // Các trường có thể chỉnh sửa
        document.getElementById('constructionCode').value = construction.constructionCode || '';
        document.getElementById('constructionCode').readOnly = false;
        document.getElementById('constructionCode').style.background = 'white';

        document.getElementById('constructionName').value = construction.constructionName || '';
        document.getElementById('constructionName').readOnly = false;
        document.getElementById('constructionName').style.background = 'white';

        document.getElementById('description').value = construction.description || '';
        document.getElementById('description').readOnly = false;
        document.getElementById('description').style.background = 'white';

        document.getElementById('notes').value = construction.notes || '';

        // Status có thể chỉnh sửa
        const statusSelect = document.getElementById('constructionStatus');
        if (statusSelect) {
            statusSelect.value = construction.constructionStatus || 'Draft';
            statusSelect.disabled = false;
            statusSelect.style.background = 'white';
        }

        // Set dates (read-only)
        const createdAtField = document.getElementById('createdAt');
        if (createdAtField && construction.createdAt) {
            createdAtField.value = formatDateTime(construction.createdAt);
            createdAtField.readOnly = true;
            createdAtField.style.background = '#f8f9fa';
        }

        const submittedAtField = document.getElementById('submittedAt');
        if (submittedAtField && construction.submittedAt) {
            submittedAtField.value = formatDateTime(construction.submittedAt);
            submittedAtField.readOnly = true;
            submittedAtField.style.background = '#f8f9fa';
        }

        // Hiển thị tất cả customer options và chọn đúng customer
        document.querySelectorAll('.customer-option').forEach(opt => {
            opt.style.display = 'block';
            if (opt.getAttribute('data-id') == construction.customerId) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });

        document.getElementById('constructionModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading construction for edit:', error);
        alert('Lỗi khi tải thông tin công trình: ' + error.message);
    }
}

// =============================================
// SHOW ADD CONSTRUCTION MODAL
// =============================================

function showAddConstructionModal() {
    document.getElementById('modalTitle').textContent = 'Thêm công trình mới';
    document.getElementById('constructionForm').reset();
    document.getElementById('constructionId').value = '';
    currentEditId = null;

    // Enable all fields for new construction
    document.getElementById('constructionCode').readOnly = false;
    document.getElementById('constructionCode').style.background = 'white';
    document.getElementById('constructionName').readOnly = false;
    document.getElementById('constructionName').style.background = 'white';
    document.getElementById('description').readOnly = false;
    document.getElementById('description').style.background = 'white';

    // Set default status to Draft
    const statusSelect = document.getElementById('constructionStatus');
    if (statusSelect) {
        statusSelect.value = 'Draft';
        statusSelect.disabled = false;
        statusSelect.style.background = 'white';
    }

    // Clear date fields
    const createdAtField = document.getElementById('createdAt');
    if (createdAtField) {
        createdAtField.value = '';
        createdAtField.readOnly = true;
        createdAtField.style.background = '#f8f9fa';
    }

    const submittedAtField = document.getElementById('submittedAt');
    if (submittedAtField) {
        submittedAtField.value = '';
        submittedAtField.readOnly = true;
        submittedAtField.style.background = '#f8f9fa';
    }

    // Show all customer options
    document.querySelectorAll('.customer-option').forEach(opt => {
        opt.style.display = 'block';
        opt.classList.remove('selected');
    });

    document.getElementById('constructionModal').style.display = 'block';
}

// =============================================
// SAVE CONSTRUCTION
// =============================================

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
        constructionStatus: document.getElementById('constructionStatus')?.value || 'Draft'
    };

    // Chỉ thêm id khi update
    if (constructionId) {
        constructionData.id = parseInt(constructionId);
    }

    try {
        if (constructionId) {
            // Update
            await callApi(`/constructions/${constructionId}`, 'PUT', constructionData);
            alert('Cập nhật công trình thành công!');
        } else {
            // Create
            await callApi('/constructions', 'POST', constructionData);
            alert('Thêm công trình thành công!');
        }

        closeModal();
        loadAllConstructions();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// =============================================
// SUBMIT CONSTRUCTION
// =============================================

async function submitConstruction(id) {
    if (!confirm('Bạn có chắc muốn gửi công trình này để duyệt?')) return;

    try {
        await callApi(`/constructions/${id}/submit`, 'PUT');
        alert('Đã gửi duyệt công trình thành công!');
        loadAllConstructions();
        closeViewModal();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// =============================================
// FILTER FUNCTIONS
// =============================================

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

// =============================================
// SEARCH FUNCTION
// =============================================

let searchTimeout;
document.getElementById('searchInput')?.addEventListener('input', function() {
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

// =============================================
// PAGINATION FUNCTIONS
// =============================================

function updatePaginationInfo(start, end, total) {
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
        paginationInfo.textContent = `Hiển thị ${start}-${end} của ${total} công trình`;
    }
}

function renderPaginationButtons() {
    const totalPages = Math.ceil(filteredConstructions.length / itemsPerPage);
    const controls = document.getElementById('paginationControls');

    if (!controls) return;

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

// =============================================
// HELPER FUNCTIONS
// =============================================

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

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// =============================================
// MODAL FUNCTIONS
// =============================================

function closeModal() {
    document.getElementById('constructionModal').style.display = 'none';
    currentEditId = null;
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

function submitForApproval() {
    if (currentViewConstruction) {
        submitConstruction(currentViewConstruction.id);
    }
}

// =============================================
// WINDOW CLICK HANDLER
// =============================================

window.onclick = function(event) {
    const constructionModal = document.getElementById('constructionModal');
    const viewModal = document.getElementById('viewConstructionModal');

    if (event.target === constructionModal) closeModal();
    if (event.target === viewModal) closeViewModal();
};