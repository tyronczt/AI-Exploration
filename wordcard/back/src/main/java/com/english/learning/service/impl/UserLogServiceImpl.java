package com.english.learning.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.english.learning.entity.UserLog;
import com.english.learning.mapper.UserLogMapper;
import com.english.learning.service.UserLogService;
import org.springframework.stereotype.Service;

@Service
public class UserLogServiceImpl extends ServiceImpl<UserLogMapper, UserLog> implements UserLogService {
}
