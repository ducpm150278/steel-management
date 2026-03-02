// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let allProducts = [];
let filteredProducts = [];
let categories = [];
let currentPage = 1;
let itemsPerPage = 10;
let deleteProductId = null;
let currentViewProduct = null;

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
    try {
        const response = await callApi('/categories');
        categories = response.data || getMockCategories();

        const categoryFilter = document.getElementById('categoryFilter');
        const categorySelect = document.getElementById('categoryId');

        categories.forEach(cat => {
            // Thêm vào filter
            const filterOption = document.createElement('option');
            filterOption.value = cat.id;
            filterOption.textContent = cat.name;
            categoryFilter.appendChild(filterOption);

            // Thêm vào select trong form
            const selectOption = document.createElement('option');
            selectOption.value = cat.id;
            selectOption.textContent = cat.name;
            categorySelect.appendChild(selectOption);
        });

        document.getElementById('totalCategories').textContent = categories.length;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Dữ liệu mẫu danh mục
function getMockCategories() {
    return [
        { id: 1, name: 'Thép H' },
        { id: 2, name: 'Thép I' },
        { id: 3, name: 'Thép hộp' },
        { id: 4, name: 'Thép ống' },
        { id: 5, name: 'Thép tấm' }
    ];
}

// Load danh sách sản phẩm
async function loadProducts() {
    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('productTableBody');

    loading.style.display = 'block';

    try {
        const response = await callApi('/products');
        allProducts = response.data || getMockProducts();

        filteredProducts = [...allProducts];
        updateStats();
        displayProducts();
    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Lỗi: ${error.message}</p>
                </td>
            </tr>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Dữ liệu mẫu sản phẩm
function getMockProducts() {
    return [
        {
            id: 1,
            productCode: 'H100x100',
            name: 'Thép H 100x100x6x8',
            categoryId: 1,
            categoryName: 'Thép H',
            unit: 'cây',
            price: 2000000,
            stockQuantity: 50,
            minStockLevel: 10,
            isActive: true,
            image: null,
            specifications: 'Cao 100mm, Rộng 100mm, Web 6mm, Flange 8mm',
            description: 'Thép hình chữ H, chiều dài 12m'
        },
        {
            id: 2,
            productCode: 'BOX50x50',
            name: 'Thép hộp 50x50x2',
            categoryId: 3,
            categoryName: 'Thép hộp',
            unit: 'cây',
            price: 500000,
            stockQuantity: 30,
            minStockLevel: 5,
            isActive: true,
            image: null,
            specifications: '50x50mm, dày 2mm',
            description: 'Thép hộp vuông, chiều dài 6m'
        },
        {
            id: 3,
            productCode: 'I150x75',
            name: 'Thép I 150x75',
            categoryId: 2,
            categoryName: 'Thép I',
            unit: 'cây',
            price: 2500000,
            stockQuantity: 20,
            minStockLevel: 8,
            isActive: true,
            image: null,
            specifications: 'Cao 150mm, Rộng 75mm',
            description: 'Thép hình chữ I, chiều dài 12m'
        },
        {
            id: 4,
            productCode: 'PIPE60',
            name: 'Thép ống 60mm',
            categoryId: 4,
            categoryName: 'Thép ống',
            unit: 'cây',
            price: 850000,
            stockQuantity: 3,
            minStockLevel: 10,
            isActive: true,
            image: null,
            specifications: 'Đường kính 60mm, dày 3mm',
            description: 'Thép ống tròn, chiều dài 6m'
        },
        {
            id: 5,
            productCode: 'PLATE10',
            name: 'Thép tấm 10mm',
            categoryId: 5,
            categoryName: 'Thép tấm',
            unit: 'tấm',
            price: 3500000,
            stockQuantity: 15,
            minStockLevel: 5,
            isActive: false,
            image: null,
            specifications: 'Dày 10mm, khổ 1500x6000mm',
            description: 'Thép tấm cán nóng'
        }
    ];
}

// Cập nhật thống kê
function updateStats() {
    const total = allProducts.length;
    const totalStock = allProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
    const lowStock = allProducts.filter(p => p.stockQuantity <= p.minStockLevel).length;

    document.getElementById('totalProducts').textContent = total;
    document.getElementById('totalStock').textContent = totalStock;
    document.getElementById('lowStock').textContent = lowStock;
}

// Hiển thị sản phẩm
function displayProducts() {
    const tableBody = document.getElementById('productTableBody');

    if (filteredProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>Không có sản phẩm nào</p>
                </td>
            </tr>
        `;
        updatePaginationInfo(0, 0, 0);
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredProducts.length);
    const paginatedProducts = filteredProducts.slice(start, end);

    let html = '';
    paginatedProducts.forEach((product, index) => {
        const stockClass = getStockClass(product.stockQuantity, product.minStockLevel);
        const stockText = product.stockQuantity ? `${product.stockQuantity} ${product.unit}` : 'Hết hàng';

        html += `
            <tr>
                <td>
                    <div class="product-image">
                        ${product.image ?
            `<img src="${product.image}" alt="${product.name}">` :
            `<i class="fas fa-image"></i>`
        }
                    </div>
                </td>
                <td><strong>${product.productCode}</strong></td>
                <td>
                    <strong>${product.name}</strong>
                    <div style="font-size: 12px; color: #6c757d;">${product.specifications || ''}</div>
                </td>
                <td><span class="category-badge">${product.categoryName || 'Chưa phân loại'}</span></td>
                <td>${product.unit}</td>
                <td><strong>${formatCurrency(product.price)}</strong></td>
                <td>
                    <span class="stock-badge ${stockClass}">${stockText}</span>
                </td>
                <td>
                    <span class="status-badge ${product.isActive ? 'status-active' : 'status-inactive'}">
                        ${product.isActive ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewProduct(${product.id})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editProduct(${product.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="showDeleteModal(${product.id}, '${product.name}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    updatePaginationInfo(start + 1, end, filteredProducts.length);
    renderPaginationButtons();
}

// Helper functions
function getStockClass(quantity, minLevel) {
    if (!quantity || quantity === 0) return 'stock-critical';
    if (quantity <= minLevel) return 'stock-low';
    return 'stock-normal';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Pagination functions
function updatePaginationInfo(start, end, total) {
    document.getElementById('paginationInfo').textContent =
        `Hiển thị ${start}-${end} của ${total} sản phẩm`;
}

function renderPaginationButtons() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
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
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    displayProducts();
}

function goToPage(page) {
    currentPage = page;
    displayProducts();
}

// Filter and Search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, 300);
});

document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryId = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredProducts = allProducts.filter(product => {
        // Search filter
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) &&
            !product.productCode.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Category filter
        if (categoryId !== 'all' && product.categoryId != categoryId) {
            return false;
        }

        // Status filter
        if (statusFilter === 'active' && !product.isActive) return false;
        if (statusFilter === 'inactive' && product.isActive) return false;

        return true;
    });

    currentPage = 1;
    displayProducts();
}

// Modal functions
function showAddProductModal() {
    document.getElementById('modalTitle').textContent = 'Thêm sản phẩm mới';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('imagePreview').innerHTML = '<i class="fas fa-camera"></i>';
    document.getElementById('productModal').style.display = 'block';
}

async function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Chỉnh sửa sản phẩm';
    document.getElementById('productId').value = product.id;
    document.getElementById('productCode').value = product.productCode;
    document.getElementById('productName').value = product.name;
    document.getElementById('categoryId').value = product.categoryId;
    document.getElementById('unit').value = product.unit;
    document.getElementById('price').value = product.price;
    document.getElementById('length').value = product.lengthPerUnit || '';
    document.getElementById('weight').value = product.weightPerUnit || '';
    document.getElementById('specifications').value = product.specifications || '';
    document.getElementById('description').value = product.description || '';
    document.getElementById('imageUrl').value = product.image || '';
    document.getElementById('isActive').checked = product.isActive;

    if (product.image) {
        document.getElementById('imagePreview').innerHTML = `<img src="${product.image}" alt="Preview">`;
    } else {
        document.getElementById('imagePreview').innerHTML = '<i class="fas fa-camera"></i>';
    }

    document.getElementById('productModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Save product
async function saveProduct() {
    const productId = document.getElementById('productId').value;

    // Validate form
    if (!document.getElementById('productCode').value) {
        alert('Vui lòng nhập mã sản phẩm!');
        return;
    }
    if (!document.getElementById('productName').value) {
        alert('Vui lòng nhập tên sản phẩm!');
        return;
    }
    if (!document.getElementById('categoryId').value) {
        alert('Vui lòng chọn danh mục!');
        return;
    }
    if (!document.getElementById('price').value) {
        alert('Vui lòng nhập giá bán!');
        return;
    }

    const productData = {
        productCode: document.getElementById('productCode').value,
        name: document.getElementById('productName').value,
        categoryId: parseInt(document.getElementById('categoryId').value),
        unit: document.getElementById('unit').value,
        price: parseFloat(document.getElementById('price').value),
        lengthPerUnit: document.getElementById('length').value ? parseFloat(document.getElementById('length').value) : null,
        weightPerUnit: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
        specifications: document.getElementById('specifications').value,
        description: document.getElementById('description').value,
        images: document.getElementById('imageUrl').value,
        isActive: document.getElementById('isActive').checked
    };

    try {
        if (productId) {
            // Update
            await callApi(`/products/${productId}`, 'PUT', productData);
            alert('Cập nhật sản phẩm thành công!');
        } else {
            // Create
            await callApi('/products', 'POST', productData);
            alert('Thêm sản phẩm thành công!');
        }

        closeModal();
        loadProducts();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// View product
function viewProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    currentViewProduct = product;

    const modalBody = document.getElementById('viewProductBody');
    const stockClass = getStockClass(product.stockQuantity, product.minStockLevel);

    modalBody.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image">
                ${product.image ?
        `<img src="${product.image}" alt="${product.name}">` :
        `<i class="fas fa-image" style="font-size: 48px; color: #dee2e6;"></i>`
    }
            </div>
            <div>
                <h3 style="margin-bottom: 15px; color: #2c3e50;">${product.name}</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Mã sản phẩm:</span>
                    <span class="detail-value">${product.productCode}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Danh mục:</span>
                    <span class="detail-value">${product.categoryName || 'Chưa phân loại'}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Đơn vị:</span>
                    <span class="detail-value">${product.unit}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Giá bán:</span>
                    <span class="detail-value"><strong style="color: #ffd700;">${formatCurrency(product.price)}</strong></span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Tồn kho:</span>
                    <span class="detail-value">
                        <span class="stock-badge ${stockClass}">${product.stockQuantity || 0} ${product.unit}</span>
                    </span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Trạng thái:</span>
                    <span class="detail-value">
                        <span class="status-badge ${product.isActive ? 'status-active' : 'status-inactive'}">
                            ${product.isActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                        </span>
                    </span>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <h4 style="margin-bottom: 10px;">Thông số kỹ thuật</h4>
            <table style="width: 100%; border-collapse: collapse;">
                ${product.lengthPerUnit ? `
                    <tr>
                        <td style="padding: 8px; background: #f8f9fa; width: 150px;">Chiều dài:</td>
                        <td style="padding: 8px;">${product.lengthPerUnit} m</td>
                    </tr>
                ` : ''}
                ${product.weightPerUnit ? `
                    <tr>
                        <td style="padding: 8px; background: #f8f9fa;">Trọng lượng:</td>
                        <td style="padding: 8px;">${product.weightPerUnit} kg</td>
                    </tr>
                ` : ''}
                ${product.specifications ? `
                    <tr>
                        <td style="padding: 8px; background: #f8f9fa;">Thông số khác:</td>
                        <td style="padding: 8px;">${product.specifications}</td>
                    </tr>
                ` : ''}
            </table>
        </div>
        
        ${product.description ? `
            <div style="margin-top: 20px;">
                <h4 style="margin-bottom: 10px;">Mô tả</h4>
                <p style="padding: 10px; background: #f8f9fa; border-radius: 6px;">${product.description}</p>
            </div>
        ` : ''}
    `;

    document.getElementById('viewProductModal').style.display = 'block';
}

function closeViewModal() {
    document.getElementById('viewProductModal').style.display = 'none';
}

function editFromView() {
    closeViewModal();
    if (currentViewProduct) {
        editProduct(currentViewProduct.id);
    }
}

// Delete functions
function showDeleteModal(id, name) {
    deleteProductId = id;
    document.getElementById('deleteProductName').textContent = name;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    deleteProductId = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!deleteProductId) return;

    try {
        await callApi(`/products/${deleteProductId}`, 'DELETE');
        alert('Xóa sản phẩm thành công!');
        closeDeleteModal();
        loadProducts();
    } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
    }
}

// Export to Excel
function exportProducts() {
    // Tạo CSV content
    let csv = 'Mã SP,Tên sản phẩm,Danh mục,Đơn vị,Giá bán,Tồn kho,Trạng thái\n';

    allProducts.forEach(p => {
        csv += `${p.productCode},${p.name},${p.categoryName || ''},${p.unit},${p.price},${p.stockQuantity || 0},${p.isActive ? 'Đang bán' : 'Ngừng bán'}\n`;
    });

    // Download CSV
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'danh_sach_san_pham.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Image preview
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            document.getElementById('imageUrl').value = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const viewModal = document.getElementById('viewProductModal');
    const deleteModal = document.getElementById('deleteModal');

    if (event.target === productModal) {
        closeModal();
    }
    if (event.target === viewModal) {
        closeViewModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
};