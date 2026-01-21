package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("permissions")
public class Permission {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;
    private String code;
    private String description;
    private Integer type;
    private String path;
    private String component;
    private String icon;
    private Long parentId;
    private Integer sort;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
