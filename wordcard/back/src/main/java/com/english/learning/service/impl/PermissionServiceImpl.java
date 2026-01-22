package com.english.learning.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.english.learning.entity.Permission;
import com.english.learning.entity.RolePermission;
import com.english.learning.entity.UserRole;
import com.english.learning.mapper.PermissionMapper;
import com.english.learning.service.PermissionService;
import com.english.learning.service.RolePermissionService;
import com.english.learning.service.UserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PermissionServiceImpl extends ServiceImpl<PermissionMapper, Permission> implements PermissionService {

    @Autowired
    private RolePermissionService rolePermissionService;
    
    @Autowired
    private UserRoleService userRoleService;
    
    @Override
    public List<Permission> getPermissionsByRoleId(Long roleId) {
        // 获取该角色关联的所有权限ID
        List<Long> permissionIds = rolePermissionService.getPermissionIdsByRoleId(roleId);
        if (permissionIds.isEmpty()) {
            return new ArrayList<>();
        }
        // 根据权限ID列表查询权限
        return listByIds(permissionIds);
    }
    
    @Override
    public List<Permission> getPermissionsByUserId(Long userId) {
        // 获取该用户关联的所有角色ID
        List<Long> roleIds = userRoleService.getRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 获取所有角色的权限ID
        List<Long> permissionIds = new ArrayList<>();
        for (Long roleId : roleIds) {
            permissionIds.addAll(rolePermissionService.getPermissionIdsByRoleId(roleId));
        }
        
        // 去重
        permissionIds = permissionIds.stream().distinct().toList();
        
        if (permissionIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 根据权限ID列表查询权限
        return listByIds(permissionIds);
    }
    
    @Override
    public List<Permission> getMenuTreeByUserId(Long userId) {
        // 获取用户的所有权限
        List<Permission> permissions = getPermissionsByUserId(userId);
        
        // 过滤出菜单权限（type=1）
        List<Permission> menuPermissions = permissions.stream()
                .filter(p -> p.getType() == 1)
                .toList();
        
        return menuPermissions;
    }
}
