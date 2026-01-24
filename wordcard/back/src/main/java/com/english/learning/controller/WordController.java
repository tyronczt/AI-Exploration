package com.english.learning.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.english.learning.entity.Word;
import com.english.learning.service.WordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
        
        List<Word> words = wordService.list(queryWrapper);
        
        // 为每个单词生成选项
        List<Word> allWords = wordService.list();
        for (Word word : words) {
            // 生成4个选项，其中包含正确答案
            List<String> options = new ArrayList<>();
            options.add(word.getChineseMeaning());
            
            // 随机选择3个不同的错误选项
            Set<String> wrongOptions = new HashSet<>();
            while (wrongOptions.size() < 3) {
                int randomIndex = (int) (Math.random() * allWords.size());
                Word randomWord = allWords.get(randomIndex);
                String wrongMeaning = randomWord.getChineseMeaning();
                if (!wrongMeaning.equals(word.getChineseMeaning())) {
                    wrongOptions.add(wrongMeaning);
                }
            }
            options.addAll(wrongOptions);
            
            // 打乱选项顺序
            Collections.shuffle(options);
            
            // 设置选项数组
            word.setOptions(options.toArray(new String[0]));
        }
        
        return words;
    }
}