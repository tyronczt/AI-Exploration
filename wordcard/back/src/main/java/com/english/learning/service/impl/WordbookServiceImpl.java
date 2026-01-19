package com.english.learning.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.english.learning.entity.Wordbook;
import com.english.learning.mapper.WordbookMapper;
import com.english.learning.service.WordbookService;
import org.springframework.stereotype.Service;

@Service
public class WordbookServiceImpl extends ServiceImpl<WordbookMapper, Wordbook> implements WordbookService {
}