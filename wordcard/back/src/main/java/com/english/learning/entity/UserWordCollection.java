package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户单词收藏表实体类
 * 记录用户收藏的单词
 */
@Data
@TableName("user_word_collections")
public class UserWordCollection {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 单词ID
     */
    private Long wordId;
    
    /**
     * 收藏时间
     */
    @TableField(value = "collection_time", fill = FieldFill.INSERT)
    private LocalDateTime collectionTime;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}