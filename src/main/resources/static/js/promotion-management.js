// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let currentPromotions = [];
let filteredPromotions = [];
let deletePromotionId = null;
let currentPage = 1;
let itemsPerPage = 10;
let currentStatusFilter = 'all';

// Load promotions khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling loadPromotions...');
    loadPromotions();
    updateActiveFilterButtons();
});

// Hàm gọi API
async function callApi(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Calling API:', url);

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
        const response = await fetch(url, options);
        console.log('API Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load tất cả promotions
async function loadPromotions() {
    console.log('Loading promotions...');

    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('promotionTableBody');

    if (loading) loading.style.display = 'block';
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="9" class="no-data"><i class="fas fa-spinner fa-spin"></i><p>Đang tải dữ liệu...</p></td></tr>';
    }

    try {
        const response = await callApi('/promotions');
        console.log('Promotions loaded:', response);

        if (response && response.success && response.data) {
            currentPromotions = response.data;
            console.log('Current promotions:', currentPromotions);

            if (currentPromotions.length === 0) {
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="no-data"><i class="fas fa-database"></i><p>Không có dữ liệu khuyến mãi</p></td></tr>';
                }
            } else {
                applyFilters();
                updateStats();
            }
        } else {
            console.error('Unexpected response structure:', response);
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="9" class="no-data"><i class="fas fa-exclamation-triangle"></i><p>Cấu trúc dữ liệu không đúng</p></td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading promotions:', error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="9" class="no-data"><i class="fas fa-exclamation-triangle"></i><p>Lỗi: ${error.message}</p></td></tr>`;
        }
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// Cập nhật thống kê
function updateStats() {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    const totalPromotions = currentPromotions.length;
    const activePromotions = currentPromotions.filter(p => p.status === 'active').length;
    const expiredPromotions = currentPromotions.filter(p => p.status === 'expired').length;
    const expiringSoon = currentPromotions.filter(p => {
        if (p.status !== 'active') return false;
        const endDate = new Date(p.endDate);
        return endDate <= threeDaysFromNow && endDate >= now;
    }).length;

    document.getElementById('totalPromotions').textContent = totalPromotions;
    document.getElementById('activePromotions').textContent = activePromotions;
    document.getElementById('expiringSoon').textContent = expiringSoon;
    document.getElementById('expiredPromotions').textContent = expiredPromotions;
}

// Áp dụng bộ lọc
function applyFilters() {
    if (currentStatusFilter === 'all') {
        filteredPromotions = [...currentPromotions];
    } else {
        filteredPromotions = currentPromotions.filter(p => p.status === currentStatusFilter);
    }

    currentPage = 1;
    displayPromotions();
}

// Lọc theo trạng thái
function filterByStatus(status) {
    currentStatusFilter = status;
    updateActiveFilterButtons();
    applyFilters();
}

// Cập nhật trạng thái active của nút lọc
function updateActiveFilterButtons() {
    const filterButtons = document.querySelectorAll('[onclick^="filterByStatus"]');
    filterButtons.forEach(btn => {
        const match = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (match) {
            const status = match[1];
            if (status === currentStatusFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// Hiển thị promotions lên bảng
function displayPromotions() {
    const tableBody = document.getElementById('promotionTableBody');

    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }

    if (!filteredPromotions || filteredPromotions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="no-data"><i class="fas fa-database"></i><p>Không có dữ liệu</p></td></tr>';
        updatePaginationInfo(0, 0, 0);
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredPromotions.length);
    const paginatedPromotions = filteredPromotions.slice(start, end);

    let html = '';
    paginatedPromotions.forEach((promo, index) => {
        const statusClass = promo.status === 'active' ? 'promo-status-active' :
            promo.status === 'inactive' ? 'promo-status-inactive' : 'promo-status-expired';
        const statusText = promo.status === 'active' ? 'Đang hoạt động' :
            promo.status === 'inactive' ? 'Ngưng' : 'Hết hạn';

        const typeClass = promo.discountType === 'percentage' ? 'type-percentage' : 'type-fixed';
        const typeText = promo.discountType === 'percentage' ? '%' : 'VNĐ';

        const usageDisplay = promo.maxUsage ?
            `${promo.usageCount || 0}/${promo.maxUsage}` :
            `${promo.usageCount || 0}/∞`;

        html += `
            <tr>
                <td>${start + index + 1}</td>
                <td><strong>${promo.code}</strong></td>
                <td>${promo.description || '-'}</td>
                <td><span class="discount-type-badge ${typeClass}">${typeText}</span></td>
                <td><strong>${formatDiscount(promo)}</strong></td>
                <td>${usageDisplay}</td>
                <td>${formatDateRange(promo)}</td>
                <td>
                    <span class="promo-status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewPromotion(${promo.promotionId})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editPromotion(${promo.promotionId})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="showDeleteModal(${promo.promotionId}, '${promo.code}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    updatePaginationInfo(start + 1, end, filteredPromotions.length);
    renderPaginationButtons();
}

// Format discount display
function formatDiscount(promo) {
    if (promo.discountType === 'percentage') {
        return `${promo.discountPercentage}%`;
    } else {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.discountValue);
    }
}

// Format date range
function formatDateRange(promo) {
    if (!promo.startDate || !promo.endDate) return '-';
    const start = new Date(promo.startDate).toLocaleDateString('vi-VN');
    const end = new Date(promo.endDate).toLocaleDateString('vi-VN');
    return `${start} - ${end}`;
}

// Cập nhật thông tin phân trang
function updatePaginationInfo(start, end, total) {
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
        paginationInfo.textContent = `Hiển thị ${start}-${end} của ${total} khuyến mãi`;
    }
}

// Render các nút phân trang
function renderPaginationButtons() {
    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
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

// Đổi trang
function changePage(direction) {
    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    displayPromotions();
}

// Đi đến trang cụ thể
function goToPage(page) {
    currentPage = page;
    displayPromotions();
}

// Toggle discount type fields
function toggleDiscountType() {
    const type = document.getElementById('discountType').value;
    const percentageField = document.getElementById('percentageField');
    const fixedField = document.getElementById('fixedField');

    if (type === 'percentage') {
        percentageField.style.display = 'block';
        fixedField.style.display = 'none';
        document.getElementById('discountPercentage').required = true;
        document.getElementById('discountValue').required = false;
    } else {
        percentageField.style.display = 'none';
        fixedField.style.display = 'block';
        document.getElementById('discountPercentage').required = false;
        document.getElementById('discountValue').required = true;
    }
}

// Search
let searchTimeout;
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const keyword = e.target.value.trim().toLowerCase();

                if (!keyword) {
                    applyFilters();
                    return;
                }

                filteredPromotions = currentPromotions.filter(promo =>
                    (promo.code && promo.code.toLowerCase().includes(keyword)) ||
                    (promo.description && promo.description.toLowerCase().includes(keyword))
                );

                currentPage = 1;
                displayPromotions();
            }, 300);
        });
    }
});

// Modal functions
function showAddPromotionModal() {
    document.getElementById('modalTitle').textContent = 'Thêm khuyến mãi mới';
    document.getElementById('promotionForm').reset();
    document.getElementById('promotionId').value = '';

    // Set default dates
    const now = new Date();
    const nextMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    document.getElementById('startDate').value = formatDateTimeLocal(now);
    document.getElementById('endDate').value = formatDateTimeLocal(nextMonth);

    document.getElementById('promotionModal').style.display = 'block';
}

async function editPromotion(id) {
    try {
        const response = await callApi(`/promotions/${id}`);
        const promo = response.data;

        document.getElementById('modalTitle').textContent = 'Chỉnh sửa khuyến mãi';
        document.getElementById('promotionId').value = promo.promotionId;
        document.getElementById('code').value = promo.code;
        document.getElementById('description').value = promo.description || '';
        document.getElementById('discountType').value = promo.discountType;

        toggleDiscountType();

        if (promo.discountType === 'percentage') {
            document.getElementById('discountPercentage').value = promo.discountPercentage;
        } else {
            document.getElementById('discountValue').value = promo.discountValue;
        }

        document.getElementById('maxUsage').value = promo.maxUsage || '';
        document.getElementById('startDate').value = formatDateTimeLocal(new Date(promo.startDate));
        document.getElementById('endDate').value = formatDateTimeLocal(new Date(promo.endDate));
        document.getElementById('status').value = promo.status;

        document.getElementById('promotionModal').style.display = 'block';
    } catch (error) {
        alert('Lỗi khi tải thông tin khuyến mãi: ' + error.message);
    }
}

function viewPromotion(id) {
    const promo = currentPromotions.find(p => p.promotionId === id);
    if (!promo) return;

    document.getElementById('viewCode').textContent = promo.code;
    document.getElementById('viewDescription').textContent = promo.description || '-';
    document.getElementById('viewDiscountType').textContent =
        promo.discountType === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định';
    document.getElementById('viewDiscountValue').textContent = formatDiscount(promo);
    document.getElementById('viewUsageCount').textContent = promo.usageCount || 0;
    document.getElementById('viewMaxUsage').textContent = promo.maxUsage || 'Không giới hạn';
    document.getElementById('viewDateRange').textContent = formatDateRange(promo);

    const statusText = promo.status === 'active' ? 'Đang hoạt động' :
        promo.status === 'inactive' ? 'Ngưng hoạt động' : 'Hết hạn';
    document.getElementById('viewStatus').textContent = statusText;

    if (promo.createdAt) {
        const date = new Date(promo.createdAt);
        document.getElementById('viewCreatedAt').textContent = date.toLocaleString('vi-VN');
    } else {
        document.getElementById('viewCreatedAt').textContent = '-';
    }

    document.getElementById('viewModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('promotionModal').style.display = 'none';
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// Save promotion
async function savePromotion() {
    const promoId = document.getElementById('promotionId').value;
    const discountType = document.getElementById('discountType').value;

    const promoData = {
        code: document.getElementById('code').value,
        description: document.getElementById('description').value,
        discountType: discountType,
        maxUsage: document.getElementById('maxUsage').value ? parseInt(document.getElementById('maxUsage').value) : null,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        status: document.getElementById('status').value
    };

    if (discountType === 'percentage') {
        promoData.discountPercentage = parseFloat(document.getElementById('discountPercentage').value);
        if (!promoData.discountPercentage || promoData.discountPercentage <= 0 || promoData.discountPercentage > 100) {
            alert('Vui lòng nhập phần trăm giảm từ 1-100!');
            return;
        }
    } else {
        promoData.discountValue = parseInt(document.getElementById('discountValue').value);
        if (!promoData.discountValue || promoData.discountValue < 1000) {
            alert('Vui lòng nhập số tiền giảm (tối thiểu 1,000đ)!');
            return;
        }
    }

    if (!promoData.code) {
        alert('Vui lòng nhập mã khuyến mãi!');
        return;
    }

    if (new Date(promoData.startDate) >= new Date(promoData.endDate)) {
        alert('Ngày kết thúc phải sau ngày bắt đầu!');
        return;
    }

    try {
        if (promoId) {
            await callApi(`/promotions/${promoId}`, 'PUT', promoData);
            alert('Cập nhật thành công!');
        } else {
            await callApi('/promotions', 'POST', promoData);
            alert('Thêm mới thành công!');
        }

        closeModal();
        loadPromotions();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Delete functions
function showDeleteModal(id, code) {
    deletePromotionId = id;
    document.getElementById('deletePromoCode').textContent = code;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    deletePromotionId = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!deletePromotionId) return;

    try {
        await callApi(`/promotions/${deletePromotionId}`, 'DELETE');
        alert('Xóa thành công!');
        closeDeleteModal();
        loadPromotions();
    } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
    }
}

// Helper function
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const promoModal = document.getElementById('promotionModal');
    const deleteModal = document.getElementById('deleteModal');
    const viewModal = document.getElementById('viewModal');

    if (event.target === promoModal) {
        closeModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
    if (event.target === viewModal) {
        closeViewModal();
    }
}