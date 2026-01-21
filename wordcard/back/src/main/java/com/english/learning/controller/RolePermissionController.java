package com.english.learning.controller;

import com.english.learning.service.RolePermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role-permissions")
@Tag(name = "角色权限管理", description = "角色权限关联相关接口")
public class RolePermissionController {

    @Autowired
    private RolePermissionService rolePermissionService;

    @Operation(summary = "根据角色ID获取权限列表", description = "根据角色ID获取该角色拥有的所有权限ID列表")
    @GetMapping("/role/{roleId}")
    public List<Long> getPermissionIdsByRoleId(@PathVariable Long roleId) {
        return rolePermissionService.getPermissionIdsByRoleId(roleId);
    }

    @Operation(summary = "为角色分配权限", description = "为指定角色分配权限，会覆盖原有权限")
    @PostMapping("/assign")
    public boolean assignPermissionsToRole(@RequestParam Long roleId, @RequestBody List<Long> permissionIds) {
        return rolePermissionService.assignPermissionsToRole(roleId, permissionIds);
    }
}