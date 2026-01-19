package com.english.learning.controller;

import com.english.learning.entity.Wordbook;
import com.english.learning.service.WordbookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wordbooks")
@Tag(name = "词库管理", description = "词库相关接口")
public class WordbookController {

    @Autowired
    private WordbookService wordbookService;

    @Operation(summary = "获取所有词库", description = "获取系统中所有词库列表")
    @GetMapping
    public List<Wordbook> getAllWordbooks() {
        return wordbookService.list();
    }

    @Operation(summary = "根据ID获取词库", description = "根据词库ID获取词库详情")
    @GetMapping("/{id}")
    public Wordbook getWordbookById(@PathVariable Long id) {
        return wordbookService.getById(id);
    }

    @Operation(summary = "创建词库", description = "创建新词库")
    @PostMapping
    public boolean createWordbook(@RequestBody Wordbook wordbook) {
        return wordbookService.save(wordbook);
    }

    @Operation(summary = "更新词库", description = "更新词库信息")
    @PutMapping("/{id}")
    public boolean updateWordbook(@PathVariable Long id, @RequestBody Wordbook wordbook) {
        wordbook.setId(id);
        return wordbookService.updateById(wordbook);
    }

    @Operation(summary = "删除词库", description = "根据ID删除词库")
    @DeleteMapping("/{id}")
    public boolean deleteWordbook(@PathVariable Long id) {
        return wordbookService.removeById(id);
    }
}