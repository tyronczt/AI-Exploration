package com.english.learning.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.english.learning.entity.RolePermission;
import com.english.learning.mapper.RolePermissionMapper;
import com.english.learning.service.RolePermissionService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RolePermissionServiceImpl extends ServiceImpl<RolePermissionMapper, RolePermission> implements RolePermissionService {

    @Override
    public List<Long> getPermissionIdsByRoleId(Long roleId) {
        return lambdaQuery()
                .eq(RolePermission::getRoleId, roleId)
                .list()
                .stream()
                .map(RolePermission::getPermissionId)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public boolean assignPermissionsToRole(Long roleId, List<Long> permissionIds) {
        // 先删除该角色的所有现有权限关联
        lambdaUpdate()
                .eq(RolePermission::getRoleId, roleId)
                .remove();
        
        // 批量插入新的权限关联
        List<RolePermission> rolePermissions = new java.util.ArrayList<>();
        for (Long permissionId : permissionIds) {
            RolePermission rolePermission = new RolePermission();
            rolePermission.setRoleId(roleId);
            rolePermission.setPermissionId(permissionId);
            rolePermissions.add(rolePermission);
        }
        
        return saveBatch(rolePermissions);
    }
}
