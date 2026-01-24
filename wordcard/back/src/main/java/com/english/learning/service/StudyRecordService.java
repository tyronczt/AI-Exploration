package com.english.learning.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.english.learning.entity.StudyRecord;

import java.util.List;
import java.util.Map;

/**
 * 学习记录Service接口
 */
public interface StudyRecordService extends IService<StudyRecord> {
    
    /**
     * 保存学习记录
     * @param studyRecord 学习记录实体
     * @return 是否保存成功
     */
    boolean saveStudyRecord(StudyRecord studyRecord);
    
    /**
     * 获取用户词库的学习进度
     * @param userId 用户ID
     * @param wordbookId 词库ID
     * @return 学习进度信息
     */
    Integer getStudyProgress(Long userId, Long wordbookId);
    
    /**
     * 获取用户词库的学习统计信息
     * @param userId 用户ID
     * @param wordbookId 词库ID
     * @return 包含新学词、待复习词数量的Map
     */
    Map<String, Integer> getStudyStatistics(Long userId, Long wordbookId);
    
    /**
     * 获取用户学习记录列表
     * @param userId 用户ID
     * @return 学习记录列表
     */
    Object getStudyRecords(Long userId);
    
    /**
     * 获取用户生词列表
     * @param userId 用户ID
     * @return 生词列表
     */
    Object getWordList(Long userId);
}