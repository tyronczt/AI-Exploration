package com.english.learning.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.english.learning.entity.Permission;

import java.util.List;

public interface PermissionService extends IService<Permission> {
    /**
     * 根据角色ID获取权限列表
     * @param roleId 角色ID
     * @return 权限列表
     */
    List<Permission> getPermissionsByRoleId(Long roleId);
    
    /**
     * 根据用户ID获取权限列表
     * @param userId 用户ID
     * @return 权限列表
     */
    List<Permission> getPermissionsByUserId(Long userId);
    
    /**
     * 根据用户ID获取菜单树
     * @param userId 用户ID
     * @return 菜单树列表
     */
    List<Permission> getMenuTreeByUserId(Long userId);
}
