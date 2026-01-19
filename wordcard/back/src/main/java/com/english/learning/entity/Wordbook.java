package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("wordbooks")
public class Wordbook {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String name;
    private String description;
    private String category;
    private Integer difficultyLevel;
    private Integer wordCount;
    private String coverImageUrl;
    private Boolean isPublic;
    private Long creatorId;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}