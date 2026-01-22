package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_logs")
public class UserLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    
    private String username;
    
    private LocalDateTime loginTime;
    
    private String loginIp;
    
    private String loginDevice;
    
    private String loginPlatform;
    
    private Integer loginStatus;
    
    private String failReason;
    
    private String userAgent;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
