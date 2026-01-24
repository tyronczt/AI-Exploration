package com.english.learning.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("words")
public class Word {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long wordbookId;
    private String word;
    private String pronunciation;
    private String audioUrl;
    private String partOfSpeech;
    private String chineseMeaning;
    private String englishDefinition;
    private String exampleSentence;
    private String exampleTranslation;
    private Integer difficultyLevel;
    private Integer frequencyRank;
    private String tags;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    @TableField(exist = false)
    private String[] options;
}