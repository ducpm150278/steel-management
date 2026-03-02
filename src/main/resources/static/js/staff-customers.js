// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let allCustomers = [];
let filteredCustomers = [];
let currentPage = 1;
let itemsPerPage = 10;
let deleteCustomerId = null;
let currentViewCustomer = null;

// Load data khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
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

// Load danh sách khách hàng
async function loadCustomers() {
    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('customerTableBody');

    loading.style.display = 'block';
    tableBody.innerHTML = `
        <tr>
            <td colspan="9" class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu từ database...</p>
            </td>
        </tr>
    `;

    try {
        const response = await callApi('/customers');
        console.log('✅ Dữ liệu từ database:', response.data);

        allCustomers = response.data || [];

        if (allCustomers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-database"></i>
                        <p>Chưa có khách hàng nào trong database</p>
                    </td>
                </tr>
            `;
        } else {
            filteredCustomers = [...allCustomers];
            updateStats();
            displayCustomers();
        }
    } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Không thể kết nối đến database</p>
                    <small style="color: #dc3545;">${error.message}</small>
                </td>
            </tr>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Cập nhật thống kê
function updateStats() {
    const total = allCustomers.length;
    const retailers = allCustomers.filter(c => c.customerType === 'retailer').length;
    const contractors = allCustomers.filter(c => c.customerType === 'contractor').length;
    const wholesalers = allCustomers.filter(c => c.customerType === 'wholesaler').length;

    document.getElementById('totalCustomers').textContent = total;
    document.getElementById('totalRetailers').textContent = retailers;
    document.getElementById('totalContractors').textContent = contractors;
    document.getElementById('totalWholesalers').textContent = wholesalers;
}

// Hiển thị khách hàng
function displayCustomers() {
    const tableBody = document.getElementById('customerTableBody');

    if (filteredCustomers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <p>Không có khách hàng nào</p>
                </td>
            </tr>
        `;
        updatePaginationInfo(0, 0, 0);
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredCustomers.length);
    const paginatedCustomers = filteredCustomers.slice(start, end);

    let html = '';
    paginatedCustomers.forEach((customer, index) => {
        const typeClass = getTypeClass(customer.customerType);
        const typeName = getTypeName(customer.customerType);
        const creditLimit = formatCurrency(customer.creditLimit || 0);

        html += `
            <tr>
                <td><strong>${customer.customerCode}</strong></td>
                <td>
                    <strong>${customer.fullName}</strong>
                    <div style="font-size: 12px; color: #6c757d;">${customer.address || ''}</div>
                </td>
                <td>${customer.phone}</td>
                <td>${customer.email || '-'}</td>
                <td><span class="customer-type-badge ${typeClass}">${typeName}</span></td>
                <td>${customer.taxCode || '-'}</td>
                <td class="credit-limit">${creditLimit}</td>
                <td>
                    <span class="status-badge ${customer.isActive ? 'status-active' : 'status-inactive'}">
                        ${customer.isActive ? 'Hoạt động' : 'Ngừng'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewCustomer(${customer.id})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editCustomer(${customer.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="showDeleteModal(${customer.id}, '${customer.fullName}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    updatePaginationInfo(start + 1, end, filteredCustomers.length);
    renderPaginationButtons();
}

// Helper functions
function getTypeClass(type) {
    switch(type) {
        case 'retailer': return 'type-retailer';
        case 'contractor': return 'type-contractor';
        case 'wholesaler': return 'type-wholesaler';
        default: return '';
    }
}

function getTypeName(type) {
    switch(type) {
        case 'retailer': return 'Cá nhân';
        case 'contractor': return 'Nhà thầu';
        case 'wholesaler': return 'Bán buôn';
        default: return type;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Pagination functions
function updatePaginationInfo(start, end, total) {
    document.getElementById('paginationInfo').textContent =
        `Hiển thị ${start}-${end} của ${total} khách hàng`;
}

function renderPaginationButtons() {
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
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
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    displayCustomers();
}

function goToPage(page) {
    currentPage = page;
    displayCustomers();
}

// Filter and Search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 300);
});

document.getElementById('typeFilter').addEventListener('change', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredCustomers = allCustomers.filter(customer => {
        // Search filter
        if (searchTerm && !customer.fullName.toLowerCase().includes(searchTerm) &&
            !customer.customerCode.toLowerCase().includes(searchTerm) &&
            !(customer.phone && customer.phone.includes(searchTerm)) &&
            !(customer.email && customer.email.toLowerCase().includes(searchTerm))) {
            return false;
        }

        // Type filter
        if (typeFilter !== 'all' && customer.customerType !== typeFilter) {
            return false;
        }

        // Status filter
        if (statusFilter === 'active' && !customer.isActive) return false;
        if (statusFilter === 'inactive' && customer.isActive) return false;

        return true;
    });

    currentPage = 1;
    displayCustomers();
}

// Modal functions
function showAddCustomerModal() {
    document.getElementById('modalTitle').textContent = 'Thêm khách hàng mới';
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('creditLimit').value = '0';
    document.getElementById('customerModal').style.display = 'block';
}

async function editCustomer(id) {
    try {
        const response = await callApi(`/customers/${id}`);
        const customer = response.data;

        document.getElementById('modalTitle').textContent = 'Chỉnh sửa khách hàng';
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerCode').value = customer.customerCode;
        document.getElementById('fullName').value = customer.fullName;
        document.getElementById('phone').value = customer.phone;
        document.getElementById('email').value = customer.email || '';
        document.getElementById('address').value = customer.address || '';
        document.getElementById('customerType').value = customer.customerType;
        document.getElementById('taxCode').value = customer.taxCode || '';
        document.getElementById('paymentTerms').value = customer.paymentTerms || '';
        document.getElementById('creditLimit').value = customer.creditLimit || 0;
        document.getElementById('isActive').checked = customer.isActive;

        document.getElementById('customerModal').style.display = 'block';
    } catch (error) {
        alert('Lỗi khi tải thông tin khách hàng: ' + error.message);
    }
}

function closeModal() {
    document.getElementById('customerModal').style.display = 'none';
}

// Save customer
async function saveCustomer() {
    const customerId = document.getElementById('customerId').value;

    // Validate form
    if (!document.getElementById('customerCode').value) {
        alert('Vui lòng nhập mã khách hàng!');
        return;
    }
    if (!document.getElementById('fullName').value) {
        alert('Vui lòng nhập họ tên!');
        return;
    }
    if (!document.getElementById('phone').value) {
        alert('Vui lòng nhập số điện thoại!');
        return;
    }
    if (!document.getElementById('customerType').value) {
        alert('Vui lòng chọn loại khách hàng!');
        return;
    }

    const customerData = {
        customerCode: document.getElementById('customerCode').value,
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value || null,
        address: document.getElementById('address').value || null,
        customerType: document.getElementById('customerType').value,
        taxCode: document.getElementById('taxCode').value || null,
        paymentTerms: document.getElementById('paymentTerms').value || null,
        creditLimit: parseFloat(document.getElementById('creditLimit').value) || 0,
        isActive: document.getElementById('isActive').checked,
        createdBy: 1 // Tạm thời set staff ID = 1
    };

    try {
        if (customerId) {
            // Update
            await callApi(`/customers/${customerId}`, 'PUT', customerData);
            alert('Cập nhật khách hàng thành công!');
        } else {
            // Create
            await callApi('/customers', 'POST', customerData);
            alert('Thêm khách hàng thành công!');
        }

        closeModal();
        loadCustomers();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// View customer
function viewCustomer(id) {
    const customer = allCustomers.find(c => c.id === id);
    if (!customer) return;

    currentViewCustomer = customer;

    const modalBody = document.getElementById('viewCustomerBody');
    const typeName = getTypeName(customer.customerType);

    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">${customer.fullName}</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; background: #f8f9fa; width: 150px;">Mã khách hàng:</td>
                    <td style="padding: 10px;"><strong>${customer.customerCode}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Loại khách hàng:</td>
                    <td style="padding: 10px;"><span class="customer-type-badge ${getTypeClass(customer.customerType)}">${typeName}</span></td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Số điện thoại:</td>
                    <td style="padding: 10px;">${customer.phone}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Email:</td>
                    <td style="padding: 10px;">${customer.email || '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Địa chỉ:</td>
                    <td style="padding: 10px;">${customer.address || '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Mã số thuế:</td>
                    <td style="padding: 10px;">${customer.taxCode || '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Điều khoản thanh toán:</td>
                    <td style="padding: 10px;">${customer.paymentTerms || '-'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Hạn mức tín dụng:</td>
                    <td style="padding: 10px;" class="credit-limit">${formatCurrency(customer.creditLimit || 0)}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Trạng thái:</td>
                    <td style="padding: 10px;">
                        <span class="status-badge ${customer.isActive ? 'status-active' : 'status-inactive'}">
                            ${customer.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; background: #f8f9fa;">Ngày tạo:</td>
                    <td style="padding: 10px;">${formatDate(customer.createdAt)}</td>
                </tr>
            </table>
        </div>
    `;

    document.getElementById('viewCustomerModal').style.display = 'block';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function closeViewModal() {
    document.getElementById('viewCustomerModal').style.display = 'none';
}

function editFromView() {
    closeViewModal();
    if (currentViewCustomer) {
        editCustomer(currentViewCustomer.id);
    }
}

// Delete functions
function showDeleteModal(id, name) {
    deleteCustomerId = id;
    document.getElementById('deleteCustomerName').textContent = name;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    deleteCustomerId = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!deleteCustomerId) return;

    if (!confirm('Bạn có chắc muốn xóa khách hàng này?')) return;

    try {
        await callApi(`/customers/${deleteCustomerId}`, 'DELETE');
        alert('Xóa khách hàng thành công!');
        closeDeleteModal();
        loadCustomers();
    } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
    }
}

// Export to Excel
function exportCustomers() {
    let csv = 'Mã KH,Họ tên,SĐT,Email,Loại KH,Mã số thuế,Hạn mức,Địa chỉ,Trạng thái\n';

    allCustomers.forEach(c => {
        csv += `${c.customerCode},${c.fullName},${c.phone},${c.email || ''},${getTypeName(c.customerType)},${c.taxCode || ''},${c.creditLimit || 0},${c.address || ''},${c.isActive ? 'Hoạt động' : 'Ngừng'}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'danh_sach_khach_hang.csv');
    link.click();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const customerModal = document.getElementById('customerModal');
    const viewModal = document.getElementById('viewCustomerModal');
    const deleteModal = document.getElementById('deleteModal');

    if (event.target === customerModal) closeModal();
    if (event.target === viewModal) closeViewModal();
    if (event.target === deleteModal) closeDeleteModal();
};