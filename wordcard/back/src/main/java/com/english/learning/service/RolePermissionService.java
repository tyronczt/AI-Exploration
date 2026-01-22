package com.english.learning.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.english.learning.entity.RolePermission;

import java.util.List;

public interface RolePermissionService extends IService<RolePermission> {
    /**
     * 根据角色ID获取权限ID列表
     * @param roleId 角色ID
     * @return 权限ID列表
     */
    List<Long> getPermissionIdsByRoleId(Long roleId);

    /**
     * 为角色分配权限，会覆盖原有权限
     * @param roleId 角色ID
     * @param permissionIds 权限ID列表
     * @return 是否分配成功
     */
    boolean assignPermissionsToRole(Long roleId, List<Long> permissionIds);
}
