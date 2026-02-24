// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let currentStaffId = 1; // Giả sử staff đang đăng nhập có ID = 1
let currentStaffName = 'Trần Văn B';
let currentStaffRole = 'Staff';

let selectedCustomer = null;
let cart = [];
let availableProducts = [];
let availablePromotions = [];
let selectedPromotion = null;
let myContracts = [];

// Load data khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    loadProducts();
    loadPromotions();
    loadMyContracts();
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
            displayCustomers(response.data);
        } else {
            displayMockCustomers();
        }
    } catch (error) {
        console.error('Error loading customers, using mock data:', error);
        displayMockCustomers();
    }
}

function displayCustomers(customers) {
    const customerList = document.getElementById('customerList');

    customerList.innerHTML = customers.map(customer => `
        <div class="customer-item" onclick="selectCustomer(${customer.id})">
            <div class="customer-name">${customer.fullName || customer.full_name}</div>
            <div class="customer-info">
                <span><i class="fas fa-phone"></i> ${customer.phone}</span>
                <span><i class="fas fa-envelope"></i> ${customer.email}</span>
            </div>
            <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">
                Mã số thuế: ${customer.taxCode || 'Chưa có'}
            </div>
        </div>
    `).join('');
}

function displayMockCustomers() {
    const mockCustomers = getMockCustomers();
    const customerList = document.getElementById('customerList');

    customerList.innerHTML = mockCustomers.map(customer => `
        <div class="customer-item" onclick="selectCustomer(${customer.id})">
            <div class="customer-name">${customer.fullName}</div>
            <div class="customer-info">
                <span><i class="fas fa-phone"></i> ${customer.phone}</span>
                <span><i class="fas fa-envelope"></i> ${customer.email}</span>
            </div>
            <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">
                Mã số thuế: ${customer.taxCode || 'Chưa có'}
            </div>
        </div>
    `).join('');
}

function getMockCustomers() {
    return [
        { id: 1, fullName: 'Công ty Xây dựng XYZ', phone: '0901234567', email: 'info@xyz.vn', taxCode: '0123456789' },
        { id: 2, fullName: 'Nguyễn Văn D', phone: '0900000004', email: 'customer1@email.com', taxCode: null },
        { id: 3, fullName: 'Công ty ABC', phone: '0909876543', email: 'contact@abc.vn', taxCode: '9876543210' },
        { id: 4, fullName: 'Công ty TNHH Xây dựng Nam Phát', phone: '0912345678', email: 'namphat@example.com', taxCode: '0123456789' },
        { id: 5, fullName: 'DNTN Thương mại Hoàng Gia', phone: '0923456789', email: 'hoanggia@example.com', taxCode: '0987654321' }
    ];
}

function selectCustomer(customerId) {
    const customers = getMockCustomers();
    selectedCustomer = customers.find(c => c.id === customerId);

    // Update UI
    document.querySelectorAll('.customer-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    console.log('Selected customer:', selectedCustomer);
}

// =============================================
// PRODUCT FUNCTIONS
// =============================================

async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await callApi('/products');
        console.log('Products response:', response);

        if (response.data && response.data.length > 0) {
            displayProducts(response.data);
        } else {
            displayMockProducts();
        }
    } catch (error) {
        console.error('Error loading products, using mock data:', error);
        displayMockProducts();
    }
}

function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');

    productGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-code">${product.productCode}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatCurrency(product.price || 1000000)}</div>
            <div class="product-stock">
                <i class="fas fa-cube"></i> Còn ${product.stockQuantity || 50} ${product.unit || 'cây'}
            </div>
        </div>
    `).join('');

    availableProducts = products;
}

function displayMockProducts() {
    const mockProducts = getMockProducts();
    const productGrid = document.getElementById('productGrid');

    productGrid.innerHTML = mockProducts.map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-code">${product.productCode}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatCurrency(product.price)}</div>
            <div class="product-stock">
                <i class="fas fa-cube"></i> Còn ${product.stockQuantity} ${product.unit}
            </div>
        </div>
    `).join('');

    availableProducts = mockProducts;
}

function getMockProducts() {
    return [
        { id: 1, productCode: 'H100x100', name: 'Thép H 100x100x6x8', price: 2000000, unit: 'cây', stockQuantity: 50 },
        { id: 2, productCode: 'BOX50x50', name: 'Thép hộp 50x50x2', price: 500000, unit: 'cây', stockQuantity: 30 },
        { id: 3, productCode: 'I150x75', name: 'Thép I 150x75', price: 2500000, unit: 'cây', stockQuantity: 20 },
        { id: 4, productCode: 'T10', name: 'Thép tròn D10', price: 150000, unit: 'cây', stockQuantity: 100 },
        { id: 5, productCode: 'T12', name: 'Thép tròn D12', price: 220000, unit: 'cây', stockQuantity: 80 },
        { id: 6, productCode: 'T14', name: 'Thép tròn D14', price: 300000, unit: 'cây', stockQuantity: 60 },
        { id: 7, productCode: 'T16', name: 'Thép tròn D16', price: 400000, unit: 'cây', stockQuantity: 45 },
        { id: 8, productCode: 'BOX40x40', name: 'Thép hộp 40x40x2', price: 350000, unit: 'cây', stockQuantity: 40 },
        { id: 9, productCode: 'BOX60x60', name: 'Thép hộp 60x60x3', price: 750000, unit: 'cây', stockQuantity: 25 },
        { id: 10, productCode: 'H150x150', name: 'Thép H 150x150x7x10', price: 3500000, unit: 'cây', stockQuantity: 15 }
    ];
}

function addToCart(productId) {
    const product = availableProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            unit: product.unit
        });
    }

    renderCart();
    showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
}

// =============================================
// CART FUNCTIONS
// =============================================

function renderCart() {
    const cartDiv = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartDiv.innerHTML = '<div style="text-align: center; padding: 30px; color: #6c757d;">Giỏ hàng trống</div>';
        updateTotals();
        return;
    }

    cartDiv.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatCurrency(item.price)} / ${item.unit}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <input type="text" class="quantity-input" value="${item.quantity}" onchange="updateQuantityInput(${index}, this.value)">
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                <i class="fas fa-trash remove-btn" onclick="removeFromCart(${index})"></i>
            </div>
        </div>
    `).join('');

    updateTotals();
}

function updateQuantity(index, delta) {
    const newQuantity = cart[index].quantity + delta;
    if (newQuantity > 0 && newQuantity <= 100) {
        cart[index].quantity = newQuantity;
        renderCart();
    }
}

function updateQuantityInput(index, value) {
    const quantity = parseInt(value);
    if (quantity > 0 && quantity <= 100) {
        cart[index].quantity = quantity;
    } else {
        cart[index].quantity = 1;
    }
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
}

function clearCart() {
    if (cart.length > 0 && confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        cart = [];
        renderCart();
        showNotification('Đã xóa giỏ hàng!', 'info');
    }
}

// =============================================
// PROMOTION FUNCTIONS
// =============================================

async function loadPromotions() {
    try {
        console.log('Loading promotions...');
        const response = await callApi('/promotions/active');
        console.log('Promotions response:', response);

        if (response.data && response.data.length > 0) {
            displayPromotions(response.data);
        } else {
            displayMockPromotions();
        }
    } catch (error) {
        console.error('Error loading promotions, using mock data:', error);
        displayMockPromotions();
    }
}

function displayPromotions(promotions) {
    availablePromotions = promotions;

    const promotionSelect = document.getElementById('promotionSelect');
    promotionSelect.innerHTML = '<option value="">Chọn khuyến mãi (nếu có)</option>' +
        promotions.map(p => `
            <option value="${p.promotionId || p.id}" data-type="${p.discountType}" data-value="${p.discountPercentage || p.discountValue}">
                ${p.code} - ${p.discountType === 'percentage' ? p.discountPercentage + '%' : formatCurrency(p.discountValue)}
            </option>
        `).join('');
}

function displayMockPromotions() {
    const mockPromotions = getMockPromotions();
    availablePromotions = mockPromotions;

    const promotionSelect = document.getElementById('promotionSelect');
    promotionSelect.innerHTML = '<option value="">Chọn khuyến mãi (nếu có)</option>' +
        mockPromotions.map(p => `
            <option value="${p.id}" data-type="${p.discountType}" data-value="${p.discountPercentage || p.discountValue}">
                ${p.code} - ${p.discountType === 'percentage' ? p.discountPercentage + '%' : formatCurrency(p.discountValue)}
            </option>
        `).join('');
}

function getMockPromotions() {
    return [
        { id: 1, code: 'SALE20', discountType: 'percentage', discountPercentage: 20, description: 'Giảm 20% cho đơn hàng từ 1 triệu' },
        { id: 2, code: 'FIXED200K', discountType: 'fixed', discountValue: 200000, description: 'Giảm trực tiếp 200,000đ' },
        { id: 3, code: 'WELCOME10', discountType: 'percentage', discountPercentage: 10, description: 'Giảm 10% cho khách hàng mới' },
        { id: 4, code: 'FLASH50', discountType: 'percentage', discountPercentage: 50, description: 'Flash Sale 50%' }
    ];
}

function applyPromotion() {
    const select = document.getElementById('promotionSelect');
    const promotionId = select.value;

    if (!promotionId) {
        selectedPromotion = null;
        document.getElementById('promotionInfo').style.display = 'none';
        updateTotals();
        return;
    }

    const promotion = availablePromotions.find(p => p.id == promotionId);
    if (promotion) {
        selectedPromotion = promotion;
        document.getElementById('promotionInfo').style.display = 'block';
        document.getElementById('promotionDetail').innerHTML = `
            <strong>${promotion.code}</strong> - 
            ${promotion.discountType === 'percentage' ? `Giảm ${promotion.discountPercentage}%` : `Giảm ${formatCurrency(promotion.discountValue)}`}
            <br>
            <small>${promotion.description || ''}</small>
        `;
        updateTotals();
        showNotification('Đã áp dụng khuyến mãi!', 'success');
    }
}

// =============================================
// CALCULATION FUNCTIONS
// =============================================

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (selectedPromotion) {
        if (selectedPromotion.discountType === 'percentage') {
            discount = subtotal * (selectedPromotion.discountPercentage / 100);
            // Giới hạn discount tối đa
            if (discount > subtotal * 0.5) discount = subtotal * 0.5;
        } else {
            discount = selectedPromotion.discountValue;
            // Không giảm quá tổng tiền
            if (discount > subtotal) discount = subtotal;
        }
    }

    const total = subtotal - discount;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);

    if (discount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discount').textContent = `-${formatCurrency(discount)}`;
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }

    document.getElementById('total').textContent = formatCurrency(total);
}

// =============================================
// CONTRACT FUNCTIONS
// =============================================

function validateForm() {
    if (!selectedCustomer) {
        showNotification('Vui lòng chọn khách hàng!', 'error');
        return false;
    }

    if (!document.getElementById('constructionName').value.trim()) {
        showNotification('Vui lòng nhập tên công trình!', 'error');
        return false;
    }

    if (cart.length === 0) {
        showNotification('Vui lòng thêm sản phẩm vào giỏ hàng!', 'error');
        return false;
    }

    return true;
}

function getContractData() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (selectedPromotion) {
        if (selectedPromotion.discountType === 'percentage') {
            discount = subtotal * (selectedPromotion.discountPercentage / 100);
        } else {
            discount = selectedPromotion.discountValue;
        }
    }

    return {
        customerId: selectedCustomer.id,
        constructionName: document.getElementById('constructionName').value.trim(),
        description: document.getElementById('constructionDesc').value.trim(),
        notes: document.getElementById('contractNotes').value.trim(),
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        })),
        promotionId: selectedPromotion?.id,
        promotionCode: selectedPromotion?.code,
        subtotal: subtotal,
        discount: discount,
        total: subtotal - discount,
        createdBy: currentStaffId,
        createdAt: new Date().toISOString()
    };
}

async function saveDraft() {
    if (!validateForm()) return;

    const contractData = getContractData();
    contractData.status = 'Draft';

    try {
        // Thử gọi API nếu có
        // const response = await callApi('/staff/contracts/draft', 'POST', contractData);

        // Nếu API chưa có, lưu vào mock data
        const mockContract = {
            id: myContracts.length + 1,
            contractNumber: `HD-${new Date().getFullYear()}-${String(myContracts.length + 1).padStart(3, '0')}`,
            constructionName: contractData.constructionName,
            customerName: selectedCustomer.fullName,
            createdDate: new Date().toISOString(),
            status: 'Draft',
            finalAmount: contractData.total
        };

        myContracts.unshift(mockContract);
        displayMyContracts(myContracts);

        showNotification('Đã lưu hợp đồng nháp!', 'success');
        resetForm();
    } catch (error) {
        console.error('Error saving draft:', error);
        showNotification('Lỗi: ' + error.message, 'error');
    }
}

async function submitContract() {
    if (!validateForm()) return;

    const contractData = getContractData();
    contractData.status = 'Pending';
    contractData.submittedAt = new Date().toISOString();

    if (confirm('Bạn có chắc muốn gửi hợp đồng này để duyệt?')) {
        try {
            // Thử gọi API nếu có
            // const response = await callApi('/staff/contracts/submit', 'POST', contractData);

            // Nếu API chưa có, lưu vào mock data
            const mockContract = {
                id: myContracts.length + 1,
                contractNumber: `HD-${new Date().getFullYear()}-${String(myContracts.length + 1).padStart(3, '0')}`,
                constructionName: contractData.constructionName,
                customerName: selectedCustomer.fullName,
                createdDate: new Date().toISOString(),
                status: 'Pending',
                finalAmount: contractData.total
            };

            myContracts.unshift(mockContract);
            displayMyContracts(myContracts);

            showNotification('Đã gửi hợp đồng thành công!', 'success');
            resetForm();
        } catch (error) {
            console.error('Error submitting contract:', error);
            showNotification('Lỗi: ' + error.message, 'error');
        }
    }
}

function resetForm() {
    selectedCustomer = null;
    cart = [];
    selectedPromotion = null;
    document.getElementById('constructionName').value = '';
    document.getElementById('constructionDesc').value = '';
    document.getElementById('contractNotes').value = '';
    document.getElementById('promotionSelect').value = '';
    document.getElementById('promotionInfo').style.display = 'none';

    // Remove selected class from customer items
    document.querySelectorAll('.customer-item').forEach(item => {
        item.classList.remove('selected');
    });

    renderCart();
    showNotification('Đã làm mới form!', 'info');
}

// =============================================
// MY CONTRACTS FUNCTIONS
// =============================================

async function loadMyContracts() {
    try {
        console.log('Loading my contracts...');
        const response = await callApi(`/staff/contracts/my-contracts/${currentStaffId}`);
        console.log('My contracts response:', response);

        if (response.data && response.data.length > 0) {
            displayMyContracts(response.data);
        } else {
            displayMockMyContracts();
        }
    } catch (error) {
        console.error('Error loading my contracts, using mock data:', error);
        displayMockMyContracts();
    }
}

function displayMyContracts(contracts) {
    myContracts = contracts;

    const myContractsDiv = document.getElementById('myContracts');

    if (contracts.length === 0) {
        myContractsDiv.innerHTML = '<div style="text-align: center; padding: 30px; color: #6c757d;">Chưa có hợp đồng nào</div>';
        return;
    }

    myContractsDiv.innerHTML = contracts.map(contract => `
        <div class="contract-item">
            <div class="contract-info">
                <h4>${contract.contractNumber || 'HD-' + contract.id} - ${contract.constructionName}</h4>
                <div class="contract-meta">
                    <span><i class="fas fa-user"></i> ${contract.customerName || 'Khách hàng ' + contract.customerId}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(contract.createdDate || contract.createdAt)}</span>
                    <span><i class="fas fa-tag"></i> ${formatCurrency(contract.finalAmount || contract.total || 0)}</span>
                </div>
            </div>
            <div>
                <span class="status-badge status-${(contract.status || contract.constructionStatus || 'draft').toLowerCase()}">
                    ${getStatusText(contract.status || contract.constructionStatus)}
                </span>
                <button class="btn-icon btn-view" onclick="viewMyContract(${contract.id})" style="margin-left: 10px;">
                    <i class="fas fa-eye"></i>
                </button>
                ${(contract.status === 'Draft' || contract.constructionStatus === 'Draft') ? `
                    <button class="btn-icon btn-edit" onclick="editMyContract(${contract.id})" style="margin-left: 5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteMyContract(${contract.id})" style="margin-left: 5px;">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function displayMockMyContracts() {
    const mockContracts = getMockMyContracts();
    myContracts = mockContracts;

    const myContractsDiv = document.getElementById('myContracts');

    myContractsDiv.innerHTML = mockContracts.map(contract => `
        <div class="contract-item">
            <div class="contract-info">
                <h4>${contract.contractNumber} - ${contract.constructionName}</h4>
                <div class="contract-meta">
                    <span><i class="fas fa-user"></i> ${contract.customerName}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(contract.createdDate)}</span>
                    <span><i class="fas fa-tag"></i> ${formatCurrency(contract.finalAmount)}</span>
                </div>
            </div>
            <div>
                <span class="status-badge status-${contract.status.toLowerCase()}">${getStatusText(contract.status)}</span>
                <button class="btn-icon btn-view" onclick="viewMyContract(${contract.id})" style="margin-left: 10px;">
                    <i class="fas fa-eye"></i>
                </button>
                ${contract.status === 'Draft' ? `
                    <button class="btn-icon btn-edit" onclick="editMyContract(${contract.id})" style="margin-left: 5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteMyContract(${contract.id})" style="margin-left: 5px;">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getMockMyContracts() {
    return [
        {
            id: 1,
            contractNumber: 'HD-2025-001',
            constructionName: 'Công trình Nhà A',
            customerName: 'Công ty XYZ',
            createdDate: '2025-02-20T10:30:00',
            status: 'Pending',
            finalAmount: 120000000,
            items: [
                { name: 'Thép H 100x100', quantity: 50, price: 2000000 },
                { name: 'Thép hộp 50x50', quantity: 100, price: 500000 }
            ]
        },
        {
            id: 2,
            contractNumber: 'HD-2025-002',
            constructionName: 'Công trình Nhà B',
            customerName: 'Nguyễn Văn D',
            createdDate: '2025-02-21T14:20:00',
            status: 'Approved',
            finalAmount: 84800000,
            items: [
                { name: 'Thép I 150x75', quantity: 30, price: 2500000 }
            ]
        },
        {
            id: 3,
            contractNumber: 'HD-2025-003',
            constructionName: 'Công trình Nhà C',
            customerName: 'Công ty ABC',
            createdDate: '2025-02-22T09:15:00',
            status: 'Draft',
            finalAmount: 45000000,
            items: [
                { name: 'Thép hộp 40x40', quantity: 200, price: 225000 }
            ]
        },
        {
            id: 4,
            contractNumber: 'HD-2025-004',
            constructionName: 'Công trình Nhà D',
            customerName: 'Công ty Nam Phát',
            createdDate: '2025-02-23T11:30:00',
            status: 'Rejected',
            finalAmount: 75000000,
            rejectReason: 'Thiếu thông tin thanh toán',
            items: [
                { name: 'Thép tròn D16', quantity: 150, price: 400000 }
            ]
        }
    ];
}

function viewMyContract(contractId) {
    const contract = myContracts.find(c => c.id === contractId);
    if (!contract) return;

    let itemsHtml = '';
    if (contract.items && contract.items.length > 0) {
        itemsHtml = contract.items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e9ecef;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: right;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(item.price)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e9ecef; text-align: right;">${formatCurrency(item.quantity * item.price)}</td>
            </tr>
        `).join('');
    }

    const modalBody = document.getElementById('viewContractBody');
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
                    <td style="padding: 8px;">${contract.customerName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f8f9fa;"><strong>Ngày tạo:</strong></td>
                    <td style="padding: 8px;">${formatDate(contract.createdDate, true)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f8f9fa;"><strong>Trạng thái:</strong></td>
                    <td style="padding: 8px;">
                        <span class="status-badge status-${contract.status.toLowerCase()}">${getStatusText(contract.status)}</span>
                    </td>
                </tr>
            </table>
        </div>
        
        ${itemsHtml ? `
            <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px; color: #2c3e50;">Chi tiết sản phẩm</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #ffd700;">
                            <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                            <th style="padding: 10px; text-align: right;">Số lượng</th>
                            <th style="padding: 10px; text-align: right;">Đơn giá</th>
                            <th style="padding: 10px; text-align: right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tổng cộng:</strong></td>
                            <td style="padding: 10px; text-align: right;"><strong>${formatCurrency(contract.finalAmount)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        ` : ''}
        
        ${contract.rejectReason ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8d7da; border-radius: 8px;">
                <h4 style="color: #721c24; margin-bottom: 10px;">
                    <i class="fas fa-exclamation-circle"></i>
                    Lý do từ chối
                </h4>
                <p style="color: #721c24;">${contract.rejectReason}</p>
            </div>
        ` : ''}
    `;

    document.getElementById('viewContractModal').style.display = 'block';
}

function editMyContract(contractId) {
    const contract = myContracts.find(c => c.id === contractId);
    if (!contract || contract.status !== 'Draft') {
        showNotification('Không thể chỉnh sửa hợp đồng này!', 'error');
        return;
    }

    // Load contract data into form
    if (contract.customerName) {
        // Find and select customer
        const customers = getMockCustomers();
        const customer = customers.find(c => c.fullName === contract.customerName);
        if (customer) {
            selectedCustomer = customer;
        }
    }

    document.getElementById('constructionName').value = contract.constructionName;

    // Load cart items
    if (contract.items) {
        cart = contract.items.map(item => ({
            productId: item.productId || 1,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit || 'cây'
        }));
        renderCart();
    }

    showNotification('Đã tải dữ liệu hợp đồng để chỉnh sửa!', 'success');

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteMyContract(contractId) {
    const contract = myContracts.find(c => c.id === contractId);
    if (!contract) return;

    if (contract.status !== 'Draft') {
        showNotification('Không thể xóa hợp đồng đã gửi!', 'error');
        return;
    }

    if (confirm(`Bạn có chắc muốn xóa hợp đồng ${contract.contractNumber}?`)) {
        myContracts = myContracts.filter(c => c.id !== contractId);
        displayMyContracts(myContracts);
        showNotification('Đã xóa hợp đồng!', 'success');
    }
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

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

function getStatusText(status) {
    switch(status?.toLowerCase()) {
        case 'pending': return 'Chờ duyệt';
        case 'approved': return 'Đã duyệt';
        case 'rejected': return 'Từ chối';
        case 'draft': return 'Bản nháp';
        default: return status || '';
    }
}

function showNotification(message, type = 'info') {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#cce5ff'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'};
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// =============================================
// MODAL FUNCTIONS
// =============================================

function closeViewModal() {
    document.getElementById('viewContractModal').style.display = 'none';
}

// =============================================
// SEARCH FUNCTIONS
// =============================================

let customerSearchTimeout;
document.getElementById('customerSearch')?.addEventListener('input', function() {
    clearTimeout(customerSearchTimeout);
    customerSearchTimeout = setTimeout(() => {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('.customer-item').forEach(item => {
            const name = item.querySelector('.customer-name').textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }, 300);
});

let productSearchTimeout;
document.getElementById('productSearch')?.addEventListener('input', function() {
    clearTimeout(productSearchTimeout);
    productSearchTimeout = setTimeout(() => {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('.product-card').forEach(card => {
            const name = card.querySelector('.product-name').textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }, 300);
});

// =============================================
// WINDOW CLICK HANDLER
// =============================================

window.onclick = function(event) {
    const modal = document.getElementById('viewContractModal');
    if (event.target === modal) {
        closeViewModal();
    }
};

function filterByRole(role) {
    console.log('Filter by role:', role);
    // Implement filter logic here if needed
    showNotification(`Lọc theo vai trò: ${role}`, 'info');
}

function filterByStatus(status) {
    console.log('Filter by status:', status);
    // Implement filter logic here if needed
    showNotification(`Lọc theo trạng thái: ${status}`, 'info');
}

// =============================================
// EXPORT FUNCTIONS FOR HTML
// =============================================

// Make functions globally available
window.selectCustomer = selectCustomer;
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.updateQuantityInput = updateQuantityInput;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.applyPromotion = applyPromotion;
window.saveDraft = saveDraft;
window.submitContract = submitContract;
window.viewMyContract = viewMyContract;
window.editMyContract = editMyContract;
window.deleteMyContract = deleteMyContract;
window.closeViewModal = closeViewModal;
window.filterByRole = filterByRole;
window.filterByStatus = filterByStatus;