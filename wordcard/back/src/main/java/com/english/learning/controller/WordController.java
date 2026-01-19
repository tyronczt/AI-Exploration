package com.english.learning.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.learning.entity.Word;
import com.english.learning.service.WordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/words")
@Tag(name = "单词管理", description = "单词相关接口")
public class WordController {

    @Autowired
    private WordService wordService;

    @Operation(summary = "获取所有单词", description = "获取系统中所有单词列表")
    @GetMapping
    public List<Word> getAllWords() {
        return wordService.list();
    }

    @Operation(summary = "根据ID获取单词", description = "根据单词ID获取单词详情")
    @GetMapping("/{id}")
    public Word getWordById(@PathVariable Long id) {
        return wordService.getById(id);
    }

    @Operation(summary = "创建单词", description = "创建新单词")
    @PostMapping
    public boolean createWord(@RequestBody Word word) {
        return wordService.save(word);
    }

    @Operation(summary = "更新单词", description = "更新单词信息")
    @PutMapping("/{id}")
    public boolean updateWord(@PathVariable Long id, @RequestBody Word word) {
        word.setId(id);
        return wordService.updateById(word);
    }

    @Operation(summary = "删除单词", description = "根据ID删除单词")
    @DeleteMapping("/{id}")
    public boolean deleteWord(@PathVariable Long id) {
        return wordService.removeById(id);
    }
    
    @Operation(summary = "根据词库ID获取单词", description = "根据词库ID获取该词库下的所有单词")
    @GetMapping("/wordbook/{wordbookId}")
    public List<Word> getWordsByWordbookId(@PathVariable Long wordbookId) {
        LambdaQueryWrapper<Word> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Word::getWordbookId, wordbookId);
        return wordService.list(queryWrapper);
    }
}