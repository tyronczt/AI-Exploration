package com.english.learning.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.learning.entity.User;
import com.english.learning.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "用户管理", description = "用户相关接口")
public class UserController {

    @Autowired
    private UserService userService;

    @Operation(summary = "获取所有用户", description = "获取系统中所有用户列表")
    @GetMapping
    public List<User> getAllUsers() {
        return userService.list();
    }

    @Operation(summary = "根据ID获取用户", description = "根据用户ID获取用户详情")
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @Operation(summary = "创建用户", description = "创建新用户")
    @PostMapping
    public boolean createUser(@RequestBody User user) {
        return userService.save(user);
    }

    @Operation(summary = "更新用户", description = "更新用户信息")
    @PutMapping("/{id}")
    public boolean updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.updateById(user);
    }

    @Operation(summary = "删除用户", description = "根据ID删除用户")
    @DeleteMapping("/{id}")
    public boolean deleteUser(@PathVariable Long id) {
        return userService.removeById(id);
    }
    
    // 微信登录相关接口
    @Operation(summary = "微信登录", description = "处理微信小程序登录，获取或创建用户")
    @PostMapping("/wechat/login")
    public Map<String, Object> wechatLogin(@RequestBody Map<String, String> loginData) {
        String code = loginData.get("code");
        // 这里应该调用微信API获取openid和session_key
        // 暂时模拟处理，实际项目中需要对接微信API
        
        Map<String, Object> result = new HashMap<>();
        result.put("openid", "mock_openid_" + System.currentTimeMillis());
        result.put("session_key", "mock_session_key");
        result.put("token", "mock_token_" + System.currentTimeMillis());
        
        return result;
    }
    
    @Operation(summary = "根据openid获取用户", description = "根据微信openid获取用户信息")
    @GetMapping("/wechat/{openid}")
    public User getUserByOpenid(@PathVariable String openid) {
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getOpenid, openid);
        return userService.getOne(queryWrapper);
    }
    
    @Operation(summary = "更新微信用户信息", description = "更新用户的微信信息")
    @PostMapping("/wechat/update")
    public boolean updateWechatUserInfo(@RequestBody User user) {
        return userService.saveOrUpdate(user);
    }
}