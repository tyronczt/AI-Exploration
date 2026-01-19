package com.english.learning.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.english.learning.entity.Word;
import com.english.learning.mapper.WordMapper;
import com.english.learning.service.WordService;
import org.springframework.stereotype.Service;

@Service
public class WordServiceImpl extends ServiceImpl<WordMapper, Word> implements WordService {
}