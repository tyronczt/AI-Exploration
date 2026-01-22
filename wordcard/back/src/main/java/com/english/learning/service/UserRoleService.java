package com.english.learning.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.english.learning.entity.UserRole;

import java.util.List;

public interface UserRoleService extends IService<UserRole> {
    /**
     * 根据用户ID获取角色ID列表
     * @param userId 用户ID
     * @return 角色ID列表
     */
    List<Long> getRoleIdsByUserId(Long userId);
    
    /**
     * 根据角色ID获取用户ID列表
     * @param roleId 角色ID
     * @return 用户ID列表
     */
    List<Long> getUserIdsByRoleId(Long roleId);
    
    /**
     * 为用户分配角色，会覆盖原有角色
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     * @return 是否分配成功
     */
    boolean assignRolesToUser(Long userId, List<Long> roleIds);
}
