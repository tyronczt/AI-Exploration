package com.english.learning.controller;

import com.english.learning.service.UserWordCollectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户单词收藏Controller
 */
@RestController
@RequestMapping("/word/collections")
@Tag(name = "单词收藏管理", description = "单词收藏相关接口")
public class UserWordCollectionController {
    
    @Autowired
    private UserWordCollectionService userWordCollectionService;
    
    @Operation(summary = "收藏单词", description = "用户收藏指定单词")
    @PostMapping
    public boolean collectWord(@RequestParam Long userId, @RequestParam Long wordId) {
        return userWordCollectionService.collectWord(userId, wordId);
    }
    
    @Operation(summary = "取消收藏单词", description = "用户取消收藏指定单词")
    @DeleteMapping
    public boolean cancelCollectWord(@RequestParam Long userId, @RequestParam Long wordId) {
        return userWordCollectionService.cancelCollectWord(userId, wordId);
    }
    
    @Operation(summary = "检查单词是否已收藏", description = "检查用户是否已收藏指定单词")
    @GetMapping("/check")
    public boolean isWordCollected(@RequestParam Long userId, @RequestParam Long wordId) {
        return userWordCollectionService.isWordCollected(userId, wordId);
    }
    
    @Operation(summary = "获取用户收藏列表", description = "获取用户收藏的所有单词列表")
    @GetMapping("/user/{userId}")
    public Object getUserCollections(@PathVariable Long userId) {
        return userWordCollectionService.getUserCollections(userId);
    }
}