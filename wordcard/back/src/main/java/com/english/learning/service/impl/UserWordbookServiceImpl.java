package com.english.learning.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.english.learning.entity.UserWordbook;
import com.english.learning.mapper.UserWordbookMapper;
import com.english.learning.service.UserWordbookService;
import org.springframework.stereotype.Service;

@Service
public class UserWordbookServiceImpl extends ServiceImpl<UserWordbookMapper, UserWordbook> implements UserWordbookService {
}