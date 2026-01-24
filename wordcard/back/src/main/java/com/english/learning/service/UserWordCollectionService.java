package com.english.learning.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.english.learning.entity.UserWordCollection;

/**
 * 用户单词收藏Service接口
 */
public interface UserWordCollectionService extends IService<UserWordCollection> {
    
    /**
     * 收藏单词
     * @param userId 用户ID
     * @param wordId 单词ID
     * @return 是否收藏成功
     */
    boolean collectWord(Long userId, Long wordId);
    
    /**
     * 取消收藏单词
     * @param userId 用户ID
     * @param wordId 单词ID
     * @return 是否取消成功
     */
    boolean cancelCollectWord(Long userId, Long wordId);
    
    /**
     * 检查单词是否已收藏
     * @param userId 用户ID
     * @param wordId 单词ID
     * @return 是否已收藏
     */
    boolean isWordCollected(Long userId, Long wordId);
    
    /**
     * 获取用户收藏列表
     * @param userId 用户ID
     * @return 用户收藏的单词列表
     */
    Object getUserCollections(Long userId);
}