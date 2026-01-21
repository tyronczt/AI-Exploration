package com.english.learning.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.english.learning.entity.Role;
import com.english.learning.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@Tag(name = "角色管理", description = "角色相关接口")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @Operation(summary = "获取所有角色", description = "获取系统中所有角色列表")
    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.list();
    }

    @Operation(summary = "根据ID获取角色", description = "根据角色ID获取角色详情")
    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable Long id) {
        return roleService.getById(id);
    }

    @Operation(summary = "创建角色", description = "创建新角色")
    @PostMapping
    public boolean createRole(@RequestBody Role role) {
        return roleService.save(role);
    }

    @Operation(summary = "更新角色", description = "更新角色信息")
    @PutMapping("/{id}")
    public boolean updateRole(@PathVariable Long id, @RequestBody Role role) {
        role.setId(id);
        return roleService.updateById(role);
    }

    @Operation(summary = "删除角色", description = "根据ID删除角色")
    @DeleteMapping("/{id}")
    public boolean deleteRole(@PathVariable Long id) {
        return roleService.removeById(id);
    }

    @Operation(summary = "分页获取角色", description = "分页获取角色列表")
    @GetMapping("/page")
    public Page<Role> getRolesByPage(@RequestParam(defaultValue = "1") Integer page, 
                                     @RequestParam(defaultValue = "10") Integer size) {
        return roleService.page(new Page<>(page, size));
    }
}