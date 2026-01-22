package com.english.learning.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.learning.dto.LoginRequest;
import com.english.learning.dto.LoginResponse;
import com.english.learning.entity.Role;
import com.english.learning.entity.User;
import com.english.learning.entity.UserRole;
import com.english.learning.service.RoleService;
import com.english.learning.service.UserRoleService;
import com.english.learning.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "认证管理", description = "登录和登出相关接口")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private RoleService roleService;
    
    @Autowired
    private UserRoleService userRoleService;

    @Operation(summary = "登录", description = "用户登录接口")
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        System.out.println("=== 登录请求开始 ===");
        System.out.println("请求参数: " + loginRequest.getUsername() + ", " + loginRequest.getPassword());
        
        try {
            // 1. 检查是否存在管理员账号，如果不存在则自动创建
            checkAndCreateAdminUser();
            
            // 2. 根据用户名查询用户
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getUsername, loginRequest.getUsername());
            User user = userService.getOne(queryWrapper);
            System.out.println("查询到用户: " + user);
            
            // 3. 验证用户是否存在
            if (user == null) {
                System.out.println("用户不存在");
                throw new RuntimeException("用户名或密码错误");
            }
            
            // 4. 验证密码（实际项目中应该使用加密密码验证，这里简化处理）
            if (!user.getPassword().equals(loginRequest.getPassword())) {
                System.out.println("密码错误，输入密码: " + loginRequest.getPassword() + ", 数据库密码: " + user.getPassword());
                throw new RuntimeException("用户名或密码错误");
            }
            
            // 5. 验证用户状态
            if (user.getStatus() != 1) {
                System.out.println("用户状态异常: " + user.getStatus());
                throw new RuntimeException("账号已禁用");
            }
            
            // 6. 更新最后登录时间
            userService.updateLastLoginTime(user.getId());
            
            // 7. 生成JWT令牌（实际项目中应该使用JWT工具类生成，这里简化处理）
            String token = "mock_jwt_token_" + System.currentTimeMillis();
            
            // 8. 构建登录响应
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setTokenType("Bearer");
            response.setUser(user);
            response.setExpiresIn(3600L * 24 * 7); // 7天过期
            
            System.out.println("登录成功，返回响应: " + response.getToken());
            System.out.println("=== 登录请求结束 ===");
            return response;
        } catch (Exception e) {
            System.out.println("登录失败，错误信息: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== 登录请求结束 ===");
            throw e;
        }
    }
    
    /**
     * 检查并创建管理员账号
     */
    private void checkAndCreateAdminUser() {
        // 检查是否存在admin用户
        LambdaQueryWrapper<User> userQueryWrapper = new LambdaQueryWrapper<>();
        userQueryWrapper.eq(User::getUsername, "admin");
        User adminUser = userService.getOne(userQueryWrapper);
        
        if (adminUser == null) {
            // 创建管理员用户
            User user = new User();
            user.setUsername("admin");
            user.setEmail("admin@example.com");
            user.setPassword("admin123"); // 实际项目中应该使用加密密码
            user.setNickname("超级管理员");
            user.setStatus(1); // 启用状态
            userService.save(user);
            
            // 获取角色ID
            LambdaQueryWrapper<Role> roleQueryWrapper = new LambdaQueryWrapper<>();
            roleQueryWrapper.eq(Role::getCode, "admin");
            Role adminRole = roleService.getOne(roleQueryWrapper);
            
            if (adminRole != null) {
                // 创建用户角色关联
                UserRole userRole = new UserRole();
                userRole.setUserId(user.getId());
                userRole.setRoleId(adminRole.getId());
                userRoleService.save(userRole);
            }
        }
    }

    @Operation(summary = "登出", description = "用户登出接口")
    @PostMapping("/logout")
    public Map<String, Object> logout() {
        // 实际项目中应该处理令牌失效逻辑，这里简化处理
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "登出成功");
        return result;
    }

    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的信息")
    @GetMapping("/user/me")
    public User getCurrentUser() {
        // 实际项目中应该从JWT令牌中获取用户信息，这里简化处理
        // 模拟获取当前用户
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, "admin");
        return userService.getOne(queryWrapper);
    }
}
