// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let allCategories = [];
let allProducts = [];
let filteredCategories = [];
let currentPage = 1;
let itemsPerPage = 10;
let deleteCategoryId = null;

// Load data khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadProducts();
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

// Load danh sách danh mục
async function loadCategories() {
    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('categoryTableBody');

    loading.style.display = 'block';
    tableBody.innerHTML = '<tr><td colspan="9" class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Đang tải dữ liệu...</p></td></tr>';

    try {
        const response = await callApi('/categories');
        allCategories = response.data || [];

        filteredCategories = [...allCategories];
        updateStats();
        displayCategories();
        loadParentOptions();
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="9" class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Lỗi: ${error.message}</p></td></tr>`;
    } finally {
        loading.style.display = 'none';
    }
}

// Load danh sách sản phẩm để tính tổng
async function loadProducts() {
    try {
        const response = await callApi('/products');
        allProducts = response.data || [];
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Cập nhật thống kê
function updateStats() {
    const rootCategories = allCategories.filter(c => !c.parentId);
    const totalProducts = allProducts.length;
    const maxLevel = calculateMaxLevel();

    document.getElementById('rootCount').textContent = rootCategories.length;
    document.getElementById('totalCategories').textContent = allCategories.length;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('maxLevel').textContent = maxLevel;
}

// Tính cấp độ sâu nhất
function calculateMaxLevel() {
    let maxLevel = 0;

    function getLevel(categoryId, level) {
        const children = allCategories.filter(c => c.parentId === categoryId);
        if (children.length > 0) {
            children.forEach(child => getLevel(child.id, level + 1));
        } else {
            maxLevel = Math.max(maxLevel, level);
        }
    }

    allCategories.filter(c => !c.parentId).forEach(root => getLevel(root.id, 1));
    return maxLevel;
}

// Hiển thị danh sách danh mục
function displayCategories() {
    const tableBody = document.getElementById('categoryTableBody');

    if (filteredCategories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="empty-state"><i class="fas fa-folder-open"></i><p>Không có danh mục nào</p></td></tr>';
        updatePaginationInfo(0, 0, 0);
        return;
    }

    // Sắp xếp theo thứ tự
    filteredCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredCategories.length);
    const paginatedCategories = filteredCategories.slice(start, end);

    let html = '';
    paginatedCategories.forEach((category, index) => {
        const parent = allCategories.find(c => c.id === category.parentId);
        const level = getCategoryLevel(category.id);

        html += `
            <tr>
                <td>${start + index + 1}</td>
                <td><strong>${category.code}</strong></td>
                <td>${category.name}</td>
                <td>
                    ${parent ?
            `<span class="parent-badge"><i class="fas fa-folder"></i> ${parent.name}</span>` :
            '<span class="parent-badge" style="background:#e9ecef; color:#6c757d;">Danh mục gốc</span>'
        }
                </td>
                <td>Cấp ${level}</td>
                <td><strong>${category.productCount || 0}</strong></td>
                <td>${category.sortOrder || 0}</td>
                <td>
                    <span class="status-badge ${category.isActive ? 'status-active' : 'status-inactive'}">
                        ${category.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editCategory(${category.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="showDeleteModal(${category.id}, '${category.name}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    updatePaginationInfo(start + 1, end, filteredCategories.length);
    renderPaginationButtons();
}

// Lấy cấp độ của danh mục
function getCategoryLevel(categoryId) {
    let level = 1;
    let current = allCategories.find(c => c.id === categoryId);

    while (current && current.parentId) {
        level++;
        current = allCategories.find(c => c.id === current.parentId);
    }

    return level;
}

// Pagination functions
function updatePaginationInfo(start, end, total) {
    document.getElementById('paginationInfo').textContent =
        `Hiển thị ${start}-${end} của ${total} danh mục`;
}

function renderPaginationButtons() {
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
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
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    displayCategories();
}

function goToPage(page) {
    currentPage = page;
    displayCategories();
}

// Filter and Search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 300);
});

document.getElementById('statusFilter').addEventListener('change', applyFilters);

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    filteredCategories = allCategories.filter(category => {
        // Search filter
        if (searchTerm && !category.name.toLowerCase().includes(searchTerm) &&
            !category.code.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Status filter
        if (statusFilter === 'active' && !category.isActive) return false;
        if (statusFilter === 'inactive' && category.isActive) return false;

        return true;
    });

    currentPage = 1;
    displayCategories();
}

// Load options cho select danh mục cha
function loadParentOptions() {
    const parentSelect = document.getElementById('parentId');
    parentSelect.innerHTML = '<option value="">-- Không có (danh mục gốc) --</option>';

    // Chỉ hiển thị các danh mục có thể làm cha
    const rootCategories = allCategories.filter(c => !c.parentId);
    rootCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    function addOptions(categories, prefix = '', level = 0) {
        categories.forEach(cat => {
            // Không cho chọn chính nó làm cha (khi edit)
            const currentId = document.getElementById('categoryId').value;
            if (currentId && parseInt(currentId) === cat.id) return;

            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = prefix + ' ' + cat.name;
            parentSelect.appendChild(option);

            const children = allCategories.filter(c => c.parentId === cat.id)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            if (children.length > 0) {
                addOptions(children, prefix + '—', level + 1);
            }
        });
    }

    addOptions(rootCategories);
}

// Modal functions
function showAddCategoryModal() {
    document.getElementById('modalTitle').textContent = 'Thêm danh mục mới';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('categoryModal').style.display = 'block';
}

async function editCategory(id) {
    const category = allCategories.find(c => c.id === id);
    if (!category) return;

    document.getElementById('modalTitle').textContent = 'Chỉnh sửa danh mục';
    document.getElementById('categoryId').value = category.id;
    document.getElementById('code').value = category.code;
    document.getElementById('name').value = category.name;
    document.getElementById('parentId').value = category.parentId || '';
    document.getElementById('sortOrder').value = category.sortOrder || 0;
    document.getElementById('isActive').checked = category.isActive;

    // Reload parent options để loại trừ chính nó
    loadParentOptions();

    document.getElementById('categoryModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

// Save category
async function saveCategory() {
    const categoryId = document.getElementById('categoryId').value;

    // Validate
    if (!document.getElementById('code').value) {
        alert('Vui lòng nhập mã danh mục!');
        return;
    }
    if (!document.getElementById('name').value) {
        alert('Vui lòng nhập tên danh mục!');
        return;
    }

    const categoryData = {
        code: document.getElementById('code').value,
        name: document.getElementById('name').value,
        parentId: document.getElementById('parentId').value || null,
        sortOrder: parseInt(document.getElementById('sortOrder').value) || 0,
        isActive: document.getElementById('isActive').checked
    };

    try {
        if (categoryId) {
            await callApi(`/categories/${categoryId}`, 'PUT', categoryData);
            alert('Cập nhật danh mục thành công!');
        } else {
            await callApi('/categories', 'POST', categoryData);
            alert('Thêm danh mục thành công!');
        }

        closeModal();
        loadCategories();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Delete functions
function showDeleteModal(id, name) {
    deleteCategoryId = id;
    document.getElementById('deleteCategoryName').textContent = name;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    deleteCategoryId = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!deleteCategoryId) return;

    try {
        await callApi(`/categories/${deleteCategoryId}`, 'DELETE');
        alert('Xóa danh mục thành công!');
        closeDeleteModal();
        loadCategories();
    } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const categoryModal = document.getElementById('categoryModal');
    const deleteModal = document.getElementById('deleteModal');

    if (event.target === categoryModal) {
        closeModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
};