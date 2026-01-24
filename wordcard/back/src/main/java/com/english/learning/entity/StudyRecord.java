package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 学习记录表实体类
 * 记录用户学习单词的结果
 */
@Data
@TableName("study_records")
public class StudyRecord {
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
     * 词库ID
     */
    private Long wordbookId;
    
    /**
     * 学习结果：1-记住，2-忘记，3-不确定
     */
    private Integer result;
    
    /**
     * 学习时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime studyTime;
    
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