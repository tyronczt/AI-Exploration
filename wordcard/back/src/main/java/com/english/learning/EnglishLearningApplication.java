package com.english.learning;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.english.learning.mapper")
public class EnglishLearningApplication {

    public static void main(String[] args) {
        SpringApplication.run(EnglishLearningApplication.class, args);
    }

}