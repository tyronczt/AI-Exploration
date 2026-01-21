package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("role_permissions")
public class RolePermission {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long roleId;
    private Long permissionId;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
