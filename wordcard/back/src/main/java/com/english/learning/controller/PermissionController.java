package com.english.learning.controller;

import com.english.learning.entity.Permission;
import com.english.learning.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@Tag(name = "权限管理", description = "权限相关接口")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    @Operation(summary = "获取所有权限", description = "获取系统中所有权限列表")
    @GetMapping
    public List<Permission> getAllPermissions() {
        return permissionService.list();
    }

    @Operation(summary = "根据ID获取权限", description = "根据权限ID获取权限详情")
    @GetMapping("/{id}")
    public Permission getPermissionById(@PathVariable Long id) {
        return permissionService.getById(id);
    }

    @Operation(summary = "创建权限", description = "创建新权限")
    @PostMapping
    public boolean createPermission(@RequestBody Permission permission) {
        return permissionService.save(permission);
    }

    @Operation(summary = "更新权限", description = "更新权限信息")
    @PutMapping("/{id}")
    public boolean updatePermission(@PathVariable Long id, @RequestBody Permission permission) {
        permission.setId(id);
        return permissionService.updateById(permission);
    }

    @Operation(summary = "删除权限", description = "根据ID删除权限")
    @DeleteMapping("/{id}")
    public boolean deletePermission(@PathVariable Long id) {
        return permissionService.removeById(id);
    }

    @Operation(summary = "根据角色ID获取权限", description = "根据角色ID获取该角色拥有的所有权限")
    @GetMapping("/role/{roleId}")
    public List<Permission> getPermissionsByRoleId(@PathVariable Long roleId) {
        return permissionService.getPermissionsByRoleId(roleId);
    }

    @Operation(summary = "根据用户ID获取权限", description = "根据用户ID获取该用户拥有的所有权限")
    @GetMapping("/user/{userId}")
    public List<Permission> getPermissionsByUserId(@PathVariable Long userId) {
        return permissionService.getPermissionsByUserId(userId);
    }

    @Operation(summary = "根据用户ID获取菜单树", description = "根据用户ID获取该用户可访问的菜单树")
    @GetMapping("/menu/{userId}")
    public List<Permission> getMenuTreeByUserId(@PathVariable Long userId) {
        return permissionService.getMenuTreeByUserId(userId);
    }
}