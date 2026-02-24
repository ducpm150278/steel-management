// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// State management
let currentUsers = [];
let filteredUsers = [];
let deleteUserId = null;
let currentPage = 1;
let itemsPerPage = 10;
let currentRoleFilter = 'all';
let currentStatusFilter = 'all';

// Load users khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling loadUsers...');
    console.log('API Base URL:', API_BASE_URL);
    loadUsers();
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
        console.log('API Response data:', result);
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load tất cả users
async function loadUsers() {
    console.log('Loading users...');

    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('userTableBody');

    if (loading) loading.style.display = 'block';
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data"><i class="fas fa-spinner fa-spin"></i><p>Đang tải dữ liệu...</p></td></tr>';
    }

    try {
        const response = await callApi('/users');
        console.log('Users loaded:', response);

        if (response && response.success && response.data) {
            currentUsers = response.data;
            console.log('Current users:', currentUsers);

            if (currentUsers.length === 0) {
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="8" class="no-data"><i class="fas fa-database"></i><p>Không có dữ liệu người dùng</p></td></tr>';
                }
            } else {
                console.log(`Found ${currentUsers.length} users`);
                applyFilters();
                updateStats();
            }
        } else {
            console.error('Unexpected response structure:', response);
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="8" class="no-data"><i class="fas fa-exclamation-triangle"></i><p>Cấu trúc dữ liệu không đúng</p></td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="8" class="no-data"><i class="fas fa-exclamation-triangle"></i><p>Lỗi: ${error.message}</p></td></tr>`;
        }
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// Cập nhật thống kê
function updateStats() {
    console.log('Updating stats...');

    const totalUsers = document.getElementById('totalUsers');
    const totalAdmins = document.getElementById('totalAdmins');
    const totalStaff = document.getElementById('totalStaff');
    const totalCustomers = document.getElementById('totalCustomers');

    if (totalUsers) {
        totalUsers.textContent = currentUsers.length;
    }

    if (totalAdmins) {
        totalAdmins.textContent = currentUsers.filter(u => u.userRole === 'Admin').length;
    }

    if (totalStaff) {
        totalStaff.textContent = currentUsers.filter(u => u.userRole === 'Staff').length;
    }

    if (totalCustomers) {
        totalCustomers.textContent = currentUsers.filter(u => u.userRole === 'Customer').length;
    }
}

// Áp dụng bộ lọc
function applyFilters() {
    console.log('Applying filters...');

    if (currentRoleFilter === 'all') {
        filteredUsers = [...currentUsers];
    } else {
        filteredUsers = currentUsers.filter(u => u.userRole === currentRoleFilter);
    }

    if (currentStatusFilter !== 'all') {
        const isActive = currentStatusFilter === 'active';
        filteredUsers = filteredUsers.filter(u => u.isActive === isActive);
    }

    console.log(`Filtered users: ${filteredUsers.length}`);

    currentPage = 1;
    displayUsers();
}

// Lọc theo vai trò
function filterByRole(role) {
    currentRoleFilter = role;
    updateActiveFilterButtons();
    applyFilters();
}

// Lọc theo trạng thái
function filterByStatus(status) {
    currentStatusFilter = status;
    updateActiveFilterButtons();
    applyFilters();
}

// Cập nhật trạng thái active của nút lọc
function updateActiveFilterButtons() {
    const roleButtons = document.querySelectorAll('[onclick^="filterByRole"]');
    roleButtons.forEach(btn => {
        const match = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (match) {
            const role = match[1];
            if (role === currentRoleFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    const statusButtons = document.querySelectorAll('[onclick^="filterByStatus"]');
    statusButtons.forEach(btn => {
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

// Hiển thị users lên bảng với phân trang
function displayUsers() {
    console.log('Displaying users...');

    const tableBody = document.getElementById('userTableBody');

    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }

    if (!filteredUsers || filteredUsers.length === 0) {
        console.log('No users to display');
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data"><i class="fas fa-database"></i><p>Không có dữ liệu</p></td></tr>';
        updatePaginationInfo(0, 0, 0);
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredUsers.length);
    const paginatedUsers = filteredUsers.slice(start, end);

    console.log(`Displaying users ${start + 1} to ${end} of ${filteredUsers.length}`);

    let html = '';
    paginatedUsers.forEach((user, index) => {
        html += `
            <tr>
                <td>${start + index + 1}</td>
                <td><strong>${user.fullName || 'Chưa cập nhật'}</strong></td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>
                    <span class="role-badge role-${user.userRole || 'Unknown'}">
                        ${getRoleName(user.userRole)}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${user.isActive ? 'Active' : 'Inactive'}">
                        ${user.isActive ? 'Hoạt động' : 'Ngưng'}
                    </span>
                </td>
                <td>${formatDate(user.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewUser(${user.id})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editUser(${user.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="showDeleteModal(${user.id}, '${user.fullName}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    updatePaginationInfo(start + 1, end, filteredUsers.length);
    renderPaginationButtons();
}

// Cập nhật thông tin phân trang
function updatePaginationInfo(start, end, total) {
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
        paginationInfo.textContent = `Hiển thị ${start}-${end} của ${total} người dùng`;
    }
}

// Render các nút phân trang
function renderPaginationButtons() {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
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
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    displayUsers();
}

// Đi đến trang cụ thể
function goToPage(page) {
    currentPage = page;
    displayUsers();
}

// Helper functions
function getRoleName(role) {
    if (!role) return 'N/A';
    switch (role) {
        case 'Admin': return 'Admin';
        case 'Staff': return 'Nhân viên';
        case 'Warehouse': return 'Thủ kho';
        case 'Customer': return 'Khách hàng';
        case 'Owner': return 'Chủ DN';
        default: return role;
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return '-';
    }
}

// Search users
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

                filteredUsers = currentUsers.filter(user =>
                    (user.fullName && user.fullName.toLowerCase().includes(keyword)) ||
                    (user.email && user.email.toLowerCase().includes(keyword)) ||
                    (user.phone && user.phone.includes(keyword))
                );

                currentPage = 1;
                displayUsers();
            }, 300);
        });
    }
});

// Modal functions
function showAddUserModal() {
    document.getElementById('modalTitle').textContent = 'Thêm người dùng mới';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('password').required = true;
    document.getElementById('passwordHelp').style.display = 'none';
    document.getElementById('userModal').style.display = 'block';
}

async function editUser(id) {
    try {
        const response = await callApi(`/users/${id}`);
        const user = response.data;

        document.getElementById('modalTitle').textContent = 'Chỉnh sửa thông tin';
        document.getElementById('userId').value = user.id;
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('username').value = user.username;
        document.getElementById('userRole').value = user.userRole;
        document.getElementById('address').value = user.address || '';
        document.getElementById('isActive').checked = user.isActive;

        document.getElementById('password').required = false;
        document.getElementById('passwordHelp').style.display = 'block';
        document.getElementById('userModal').style.display = 'block';
    } catch (error) {
        alert('Lỗi khi tải thông tin user: ' + error.message);
    }
}

function viewUser(id) {
    alert(`Xem chi tiết user ID: ${id} - Chức năng đang phát triển`);
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

async function saveUser() {
    const userId = document.getElementById('userId').value;
    const userData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        username: document.getElementById('username').value,
        userRole: document.getElementById('userRole').value,
        address: document.getElementById('address').value,
        isActive: document.getElementById('isActive').checked
    };

    const password = document.getElementById('password').value;
    if (password) {
        userData.passwordHash = password;
    }

    if (!userData.fullName || !userData.email || !userData.username) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }

    try {
        if (userId) {
            await callApi(`/users/${userId}`, 'PUT', userData);
            alert('Cập nhật thành công!');
        } else {
            await callApi('/users', 'POST', userData);
            alert('Thêm mới thành công!');
        }

        closeModal();
        loadUsers();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

function showDeleteModal(id, name) {
    deleteUserId = id;
    document.getElementById('deleteUserName').textContent = name;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    deleteUserId = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (!deleteUserId) return;

    try {
        await callApi(`/users/${deleteUserId}`, 'DELETE');
        alert('Xóa thành công!');
        closeDeleteModal();
        loadUsers();
    } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
    }
}

window.onclick = function(event) {
    const userModal = document.getElementById('userModal');
    const deleteModal = document.getElementById('deleteModal');

    if (event.target === userModal) {
        closeModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
}