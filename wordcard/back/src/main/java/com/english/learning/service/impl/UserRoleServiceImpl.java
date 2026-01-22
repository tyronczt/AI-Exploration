package com.english.learning.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.english.learning.entity.UserRole;
import com.english.learning.mapper.UserRoleMapper;
import com.english.learning.service.UserRoleService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserRoleServiceImpl extends ServiceImpl<UserRoleMapper, UserRole> implements UserRoleService {

    @Override
    public List<Long> getRoleIdsByUserId(Long userId) {
        return lambdaQuery()
                .eq(UserRole::getUserId, userId)
                .list()
                .stream()
                .map(UserRole::getRoleId)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<Long> getUserIdsByRoleId(Long roleId) {
        return lambdaQuery()
                .eq(UserRole::getRoleId, roleId)
                .list()
                .stream()
                .map(UserRole::getUserId)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public boolean assignRolesToUser(Long userId, List<Long> roleIds) {
        // 先删除该用户的所有现有角色关联
        lambdaUpdate()
                .eq(UserRole::getUserId, userId)
                .remove();
        
        // 批量插入新的角色关联
        List<UserRole> userRoles = new java.util.ArrayList<>();
        for (Long roleId : roleIds) {
            UserRole userRole = new UserRole();
            userRole.setUserId(userId);
            userRole.setRoleId(roleId);
            userRoles.add(userRole);
        }
        
        return saveBatch(userRoles);
    }
}
