package com.english.learning.dto;

import com.english.learning.entity.User;
import lombok.Data;

/**
 * 登录响应DTO
 */
@Data
public class LoginResponse {
    /**
     * JWT令牌
     */
    private String token;
    
    /**
     * 令牌类型，通常为Bearer
     */
    private String tokenType;
    
    /**
     * 用户信息
     */
    private User user;
    
    /**
     * 令牌过期时间（秒）
     */
    private Long expiresIn;
}