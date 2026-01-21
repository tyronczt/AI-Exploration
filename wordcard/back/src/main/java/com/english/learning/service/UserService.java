package com.english.learning.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.english.learning.entity.User;

public interface UserService extends IService<User> {
    /**
     * 更新用户最后登录时间
     * @param userId 用户ID
     * @return 是否更新成功
     */
    boolean updateLastLoginTime(Long userId);
}