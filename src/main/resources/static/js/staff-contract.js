// API Base URL
const API_BASE_URL = '/api';

// State management
let allContracts = [];
let filteredContracts = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentStaffId = 2; // ID của staff hiện tại
let currentStaffName = 'Trần Văn B';
let currentContractId = null;
let currentViewContract = null;
let deleteContractId = null;
let deleteContractName = '';

// Load data khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Set user info
    document.getElementById('userName').textContent = currentStaffName;

    loadContracts();

    // Add event listeners
    document.getElementById('searchInput').addEventListener('input', debounce(filterContracts, 300));
    document.getElementById('statusFilter').addEventListener('change', filterContracts);
    document.getElementById('paymentFilter').addEventListener('change', filterContracts);
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
            throw new Error(`HTTP error ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// =============================================
// LOAD CONTRACTS
// =============================================

async function loadContracts() {
    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('contractsTableBody');
    const pagination = document.getElementById('pagination');

    loading.style.display = 'block';
    tableBody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu...</p>
            </td>
        </tr>
    `;

    try {
        console.log(`Loading contracts for staff: ${currentStaffId}`);
        const response = await callApi(`/staff/contracts/my-contracts/${currentStaffId}`);
        console.log('Contracts response:', response);

        if (response && response.data && response.data.length > 0) {
            allContracts = response.data;
        } else {
            allContracts = [];
        }

        filteredContracts = [...allContracts];
        updateStats();
        displayContracts();

        if (allContracts.length > 0) {
            pagination.style.display = 'flex';
        } else {
            pagination.style.display = 'none';
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-file-contract"></i>
                        <p>Không có hợp đồng nào</p>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading contracts:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Lỗi: ${error.message}</p>
                </td>
            </tr>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// =============================================
// UPDATE STATS
// =============================================

function updateStats() {
    const total = allContracts.length;
    const pending = allContracts.filter(c => c.contractStatus === 'Pending').length;
    const active = allContracts.filter(c => c.contractStatus === 'Active').length;
    const totalValue = allContracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

    document.getElementById('totalContracts').textContent = total;
    document.getElementById('pendingContracts').textContent = pending;
    document.getElementById('activeContracts').textContent = active;
    document.getElementById('totalValue').textContent = formatCurrency(totalValue);
}

// =============================================
// DISPLAY CONTRACTS (TABLE FORMAT)
// =============================================

function displayContracts() {
    const tableBody = document.getElementById('contractsTableBody');
    const pagination = document.getElementById('pagination');

    if (filteredContracts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-file-contract"></i>
                    <p>Không có hợp đồng nào</p>
                </td>
            </tr>
        `;
        pagination.style.display = 'none';
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredContracts.length);
    const paginatedContracts = filteredContracts.slice(start, end);

    let html = '';
    paginatedContracts.forEach(contract => {
        const statusClass = getStatusClass(contract.contractStatus);
        const statusText = getStatusText(contract.contractStatus);
        const paymentClass = getPaymentClass(contract.paymentStatus);
        const paymentText = getPaymentText(contract.paymentStatus);
        const canSubmit = contract.contractStatus === 'Draft';
        const canEdit = contract.contractStatus === 'Draft' || contract.contractStatus === 'Pending';

        html += `
            <tr onclick="viewContract(${contract.id})">
                <td><strong>${contract.contractNumber || 'HĐ-' + contract.id}</strong></td>
                <td>${contract.constructionName || 'Chưa có công trình'}</td>
                <td>${contract.customerName || 'Chưa có khách hàng'}</td>
                <td>${formatDate(contract.contractDate)}</td>
                <td class="amount">${formatCurrency(contract.totalAmount || 0)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td><span class="status-badge ${paymentClass}">${paymentText}</span></td>
                <td onclick="event.stopPropagation()">
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewContract(${contract.id})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${canEdit ? `
                            <button class="btn-icon btn-edit" onclick="editContract(${contract.id})" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        ${canSubmit ? `
                            <button class="btn-icon btn-submit" onclick="submitContract(${contract.id})" title="Gửi duyệt">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        ` : ''}
                        ${contract.contractStatus === 'Draft' ? `
                            <button class="btn-icon btn-delete" onclick="showDeleteModal(${contract.id}, '${contract.contractNumber}')" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    updatePaginationInfo(start + 1, end, filteredContracts.length);
    renderPaginationButtons();
}

// =============================================
// FILTER FUNCTIONS
// =============================================

function filterContracts() {
    const statusFilter = document.getElementById('statusFilter').value;
    const paymentFilter = document.getElementById('paymentFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    filteredContracts = allContracts.filter(contract => {
        // Status filter
        if (statusFilter !== 'all' && contract.contractStatus !== statusFilter) {
            return false;
        }

        // Payment filter
        if (paymentFilter !== 'all' && contract.paymentStatus !== paymentFilter) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const contractNumber = (contract.contractNumber || '').toLowerCase();
            const customerName = (contract.customerName || '').toLowerCase();
            const constructionName = (contract.constructionName || '').toLowerCase();

            if (!contractNumber.includes(searchTerm) &&
                !customerName.includes(searchTerm) &&
                !constructionName.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    currentPage = 1;
    displayContracts();
}

// =============================================
// VIEW CONTRACT DETAILS
// =============================================

async function viewContract(id) {
    try {
        console.log(`Loading contract details for ID: ${id}`);

        const response = await callApi(`/staff/contracts/detail/${id}`);
        const contract = response.data;

        if (!contract) {
            alert('Không tìm thấy hợp đồng!');
            return;
        }

        currentViewContract = contract;

        const modalBody = document.getElementById('viewContractBody');
        const editBtn = document.getElementById('editFromViewBtn');
        const submitBtn = document.getElementById('submitFromViewBtn');

        // Show buttons based on status
        if (contract.contractStatus === 'Draft' || contract.contractStatus === 'Pending') {
            editBtn.style.display = 'inline-block';
        } else {
            editBtn.style.display = 'none';
        }

        if (contract.contractStatus === 'Draft') {
            submitBtn.style.display = 'inline-block';
        } else {
            submitBtn.style.display = 'none';
        }

        // Calculate totals
        const subtotal = contract.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;
        const discount = contract.promotionDiscountAmount || 0;
        const vat = (subtotal - discount) * 0.1;
        const finalAmount = subtotal - discount + vat;

        // Create products table HTML
        let productsHtml = '';
        if (contract.items && contract.items.length > 0) {
            productsHtml = contract.items.map(item => {
                // 🟢 Lấy đơn giá - ưu tiên unitPrice, nếu không có thì dùng price
                const price = item.unitPrice || item.price || 0;
                const itemTotal = item.totalPrice || (item.quantity * price);

                return `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e9ecef;">${item.productName || 'Sản phẩm #' + item.productId}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: center;">${item.unit || 'cây'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(price)}</td>
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
                            <span class="label">Số hợp đồng</span>
                            <span class="value">${contract.contractNumber || 'Chưa có'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Ngày hợp đồng</span>
                            <span class="value">${formatDate(contract.contractDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Ngày giao hàng</span>
                            <span class="value">${formatDate(contract.deliveryDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Trạng thái</span>
                            <span class="value">
                                <span class="status-badge ${getStatusClass(contract.contractStatus)}">
                                    ${getStatusText(contract.contractStatus)}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Thông tin khách hàng</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Tên khách hàng</span>
                            <span class="value">${contract.customerName || 'Đang cập nhật'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Số điện thoại</span>
                            <span class="value">${contract.customerPhone || 'Đang cập nhật'}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Thông tin công trình</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Tên công trình</span>
                            <span class="value">${contract.constructionName || 'Đang cập nhật'}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Chi tiết sản phẩm</h3>
                    ${productsHtml ? `
                        <table class="products-table">
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
                                ${productsHtml}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" style="padding: 10px; text-align: right;"><strong>Tạm tính:</strong></td>
                                    <td style="padding: 10px; text-align: right;">${formatCurrency(subtotal)}</td>
                                </tr>
                                ${contract.promotionCode ? `
                                    <tr>
                                        <td colspan="4" style="padding: 10px; text-align: right;">
                                            <strong>Khuyến mãi (${contract.promotionCode}):</strong>
                                        </td>
                                        <td style="padding: 10px; text-align: right; color: #dc3545;">-${formatCurrency(discount)}</td>
                                    </tr>
                                ` : ''}
                                <tr>
                                    <td colspan="4" style="padding: 10px; text-align: right;"><strong>VAT (10%):</strong></td>
                                    <td style="padding: 10px; text-align: right;">${formatCurrency(vat)}</td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="4" style="padding: 10px; text-align: right;"><strong>Tổng cộng:</strong></td>
                                    <td style="padding: 10px; text-align: right;"><strong style="color: #ffd700;">${formatCurrency(finalAmount)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    ` : '<p style="padding: 20px; text-align: center; color: #6c757d;">Không có sản phẩm nào</p>'}
                </div>

                ${contract.notes ? `
                    <div class="detail-section">
                        <h3>Ghi chú</h3>
                        <p style="background: #f8f9fa; padding: 10px; border-radius: 6px;">${contract.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('viewContractModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading contract details:', error);
        alert('Lỗi khi tải chi tiết hợp đồng: ' + error.message);
    }
}

// =============================================
// EDIT CONTRACT
// =============================================

async function editContract(id) {
    try {
        console.log(`Loading contract for edit: ${id}`);

        const response = await callApi(`/staff/contracts/detail/${id}`);
        const contract = response.data;

        if (!contract) {
            alert('Không tìm thấy hợp đồng!');
            return;
        }

        document.getElementById('editContractId').value = contract.id;
        document.getElementById('editContractNumber').value = contract.contractNumber || '';
        document.getElementById('editContractDate').value = contract.contractDate || '';
        document.getElementById('editDeliveryDate').value = contract.deliveryDate || '';
        document.getElementById('editContractStatus').value = contract.contractStatus || 'Draft';
        document.getElementById('editPaymentMethod').value = contract.paymentMethod || 'bank_transfer';
        document.getElementById('editPaymentStatus').value = contract.paymentStatus || 'Unpaid';
        document.getElementById('editDepositAmount').value = contract.depositAmount || 0;
        document.getElementById('editNotes').value = contract.notes || '';

        document.getElementById('editContractModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading contract for edit:', error);
        alert('Lỗi khi tải thông tin hợp đồng: ' + error.message);
    }
}

// =============================================
// SAVE CONTRACT CHANGES
// =============================================

async function saveContractChanges() {
    const contractId = document.getElementById('editContractId').value;

    const contractData = {
        contractDate: document.getElementById('editContractDate').value,
        deliveryDate: document.getElementById('editDeliveryDate').value,
        contractStatus: document.getElementById('editContractStatus').value,
        paymentMethod: document.getElementById('editPaymentMethod').value,
        paymentStatus: document.getElementById('editPaymentStatus').value,
        depositAmount: parseFloat(document.getElementById('editDepositAmount').value) || 0,
        notes: document.getElementById('editNotes').value
    };

    try {
        const result = await callApi(`/staff/contracts/${contractId}`, 'PUT', contractData);

        if (result) {
            alert('Cập nhật hợp đồng thành công!');
            closeEditModal();
            loadContracts();
        }
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// =============================================
// SUBMIT CONTRACT
// =============================================
async function checkConstructionContract() {
    try {
        const response = await callApi(`/contracts/check-construction/${selectedConstruction.id}`);
        return response.data.exists;
    } catch (error) {
        console.error('Error checking construction:', error);
        return false;
    }
}

async function submitContract() {
    if (!validateForm()) return;

    // Kiểm tra xem công trình đã có hợp đồng chưa
    const exists = await checkConstructionContract();
    if (exists) {
        alert('Công trình này đã có hợp đồng! Không thể tạo thêm.');
        return;
    }

    if (!confirm('Bạn có chắc muốn gửi hợp đồng này để duyệt?')) return;

    const contractData = collectFormData();
    contractData.contractStatus = 'Pending';

    try {
        const response = await callApi('/contracts', 'POST', contractData);
        alert('Gửi duyệt hợp đồng thành công!');
        window.location.href = '/staff-contract';
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

async function saveDraft() {
    if (!validateForm()) return;

    // Kiểm tra xem công trình đã có hợp đồng chưa
    const exists = await checkConstructionContract();
    if (exists) {
        alert('Công trình này đã có hợp đồng! Không thể tạo thêm.');
        return;
    }

    const contractData = collectFormData();
    contractData.contractStatus = 'Draft';

    try {
        const response = await callApi('/contracts', 'POST', contractData);
        alert('Lưu nháp hợp đồng thành công!');
        window.location.href = '/staff-contract';
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

function submitFromView() {
    if (currentViewContract) {
        submitContract(currentViewContract.id);
    }
}

// =============================================
// DELETE CONTRACT
// =============================================

function showDeleteModal(id, name) {
    deleteContractId = id;
    deleteContractName = name;
    document.getElementById('deleteContractName').textContent = name;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    deleteContractId = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!deleteContractId) return;

    try {
        await callApi(`/staff/contracts/${deleteContractId}`, 'DELETE');
        alert('Xóa hợp đồng thành công!');
        closeDeleteModal();
        loadContracts();
    } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
    }
}

// =============================================
// PAGINATION FUNCTIONS
// =============================================

function updatePaginationInfo(start, end, total) {
    document.getElementById('paginationInfo').textContent =
        `Hiển thị ${start}-${end} của ${total} hợp đồng`;
}

function renderPaginationButtons() {
    const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
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
    const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    displayContracts();
}

function goToPage(page) {
    currentPage = page;
    displayContracts();
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function getStatusClass(status) {
    switch(status) {
        case 'Draft': return 'status-draft';
        case 'Pending': return 'status-pending';
        case 'Active': return 'status-active';
        case 'Completed': return 'status-completed';
        case 'Cancelled': return 'status-cancelled';
        default: return 'status-draft';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'Draft': return 'Bản nháp';
        case 'Pending': return 'Chờ duyệt';
        case 'Active': return 'Đang thực hiện';
        case 'Completed': return 'Hoàn thành';
        case 'Cancelled': return 'Đã hủy';
        default: return status || 'Không xác định';
    }
}

function getPaymentClass(status) {
    switch(status) {
        case 'Unpaid': return 'payment-unpaid';
        case 'Partial': return 'payment-partial';
        case 'Paid': return 'payment-paid';
        default: return 'payment-unpaid';
    }
}

function getPaymentText(status) {
    switch(status) {
        case 'Unpaid': return 'Chưa TT';
        case 'Partial': return 'TT một phần';
        case 'Paid': return 'Đã TT';
        default: return status || 'Chưa TT';
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================
// IMPORT/EXPORT FUNCTIONS
// =============================================

function importContracts() {
    alert('Chức năng nhập Excel đang phát triển');
}

function exportContracts() {
    if (allContracts.length === 0) {
        alert('Không có dữ liệu để xuất');
        return;
    }

    // Tạo CSV content
    let csv = 'Số HĐ,Tên công trình,Khách hàng,Ngày HĐ,Giá trị,Trạng thái HĐ,Thanh toán\n';

    allContracts.forEach(c => {
        csv += `${c.contractNumber || ''},${c.constructionName || ''},${c.customerName || ''},${c.contractDate || ''},${c.totalAmount || 0},${c.contractStatus || ''},${c.paymentStatus || ''}\n`;
    });

    // Download CSV
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'danh_sach_hop_dong.csv');
    link.click();
}

// =============================================
// MODAL FUNCTIONS
// =============================================

function closeViewModal() {
    document.getElementById('viewContractModal').style.display = 'none';
}

function closeEditModal() {
    document.getElementById('editContractModal').style.display = 'none';
}

function editFromView() {
    closeViewModal();
    if (currentViewContract) {
        editContract(currentViewContract.id);
    }
}

// =============================================
// WINDOW CLICK HANDLER
// =============================================

window.onclick = function(event) {
    const viewModal = document.getElementById('viewContractModal');
    const editModal = document.getElementById('editContractModal');
    const deleteModal = document.getElementById('deleteModal');

    if (event.target === viewModal) closeViewModal();
    if (event.target === editModal) closeEditModal();
    if (event.target === deleteModal) closeDeleteModal();
};