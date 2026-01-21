package com.english.learning.controller;

import com.english.learning.service.UserRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-roles")
@Tag(name = "用户角色管理", description = "用户角色关联相关接口")
public class UserRoleController {

    @Autowired
    private UserRoleService userRoleService;

    @Operation(summary = "根据用户ID获取角色列表", description = "根据用户ID获取该用户拥有的所有角色ID列表")
    @GetMapping("/user/{userId}")
    public List<Long> getRoleIdsByUserId(@PathVariable Long userId) {
        return userRoleService.getRoleIdsByUserId(userId);
    }

    @Operation(summary = "根据角色ID获取用户列表", description = "根据角色ID获取拥有该角色的所有用户ID列表")
    @GetMapping("/role/{roleId}")
    public List<Long> getUserIdsByRoleId(@PathVariable Long roleId) {
        return userRoleService.getUserIdsByRoleId(roleId);
    }

    @Operation(summary = "为用户分配角色", description = "为指定用户分配角色，会覆盖原有角色")
    @PostMapping("/assign")
    public boolean assignRolesToUser(@RequestParam Long userId, @RequestBody List<Long> roleIds) {
        return userRoleService.assignRolesToUser(userId, roleIds);
    }
}