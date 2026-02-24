package com.steelmanagement.steel_management.service;

import com.steelmanagement.steel_management.dto.UserDTO;
import com.steelmanagement.steel_management.entity.User;
import com.steelmanagement.steel_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // SỬA METHOD NÀY: Chỉ lấy Staff và Warehouse
    public List<UserDTO> getAllUsers() {
        List<String> allowedRoles = Arrays.asList("Staff", "Warehouse");
        return userRepository.findByUserRoleIn(allowedRoles)
                .stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // SỬA METHOD SEARCH: Cũng chỉ lấy Staff và Warehouse
    public List<UserDTO> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllUsers();
        }

        // Lấy tất cả users có role Staff hoặc Warehouse và khớp với keyword
        List<String> allowedRoles = Arrays.asList("Staff", "Warehouse");
        return userRepository.searchUsers(keyword)
                .stream()
                .filter(user -> allowedRoles.contains(user.getUserRole()))
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Giữ nguyên các method khác
    public UserDTO getUserById(Integer id) {
        return userRepository.findById(id)
                .map(UserDTO::fromEntity)
                .orElse(null);
    }

    public List<UserDTO> getUsersByRole(String role) {
        // Nếu role không phải Staff hoặc Warehouse thì trả về empty list
        if (!"Staff".equals(role) && !"Warehouse".equals(role)) {
            return List.of();
        }
        return userRepository.findByUserRole(role)
                .stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public UserDTO createUser(User user) {
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    public UserDTO updateUser(Integer id, User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setFullName(userDetails.getFullName());
                    user.setPhone(userDetails.getPhone());
                    user.setAddress(userDetails.getAddress());
                    user.setUserRole(userDetails.getUserRole());
                    user.setIsActive(userDetails.getIsActive());
                    user.setUpdatedAt(LocalDateTime.now());
                    if (userDetails.getPasswordHash() != null && !userDetails.getPasswordHash().isEmpty()) {
                        user.setPasswordHash(userDetails.getPasswordHash());
                    }
                    return UserDTO.fromEntity(userRepository.save(user));
                })
                .orElse(null);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }
}