package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_wordbooks")
public class UserWordbook {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private Long wordbookId;
    private Double progress;
    private Integer learnedCount;
    private Integer totalCount;
    private LocalDateTime lastStudyAt;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}