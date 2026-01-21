package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_roles")
public class UserRole {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private Long roleId;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
