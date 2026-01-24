package com.english.learning.controller;

import com.english.learning.entity.StudyRecord;
import com.english.learning.service.StudyRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 学习记录Controller
 */
@RestController
@RequestMapping("/study/records")
@Tag(name = "学习记录管理", description = "学习记录相关接口")
public class StudyRecordController {
    
    @Autowired
    private StudyRecordService studyRecordService;
    
    @Operation(summary = "保存学习记录", description = "保存用户的学习记录")
    @PostMapping
    public boolean saveStudyRecord(@RequestBody StudyRecord studyRecord) {
        System.out.println("保存学习记录请求到达，参数：" + studyRecord);
        try {
            boolean result = studyRecordService.saveStudyRecord(studyRecord);
            System.out.println("保存学习记录结果：" + result);
            return result;
        } catch (Exception e) {
            System.out.println("保存学习记录异常：" + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    @Operation(summary = "获取学习记录列表", description = "获取用户的学习记录列表")
    @GetMapping("/user/{userId}")
    public Object getStudyRecords(@PathVariable Long userId) {
        return studyRecordService.getStudyRecords(userId);
    }
    
    @Operation(summary = "获取生词列表", description = "获取用户的生词列表")
    @GetMapping("/wordlist/{userId}")
    public Object getWordList(@PathVariable Long userId) {
        return studyRecordService.getWordList(userId);
    }
    
    @Operation(summary = "获取学习进度", description = "获取用户在指定词库的学习进度")
    @GetMapping("/progress/{userId}/{wordbookId}")
    public Integer getStudyProgress(@PathVariable Long userId, @PathVariable Long wordbookId) {
        return studyRecordService.getStudyProgress(userId, wordbookId);
    }
    
    @Operation(summary = "获取学习统计信息", description = "获取用户在指定词库的学习统计信息，包括新学词和待复习词数量")
    @GetMapping("/statistics/{userId}/{wordbookId}")
    public java.util.Map<String, Integer> getStudyStatistics(@PathVariable Long userId, @PathVariable Long wordbookId) {
        return studyRecordService.getStudyStatistics(userId, wordbookId);
    }
}