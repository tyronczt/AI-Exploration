package com.english.learning.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 允许所有路径
        registry.addMapping("/**")
                // 允许所有来源
                .allowedOrigins("*")
                // 允许所有HTTP方法
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // 允许所有请求头
                .allowedHeaders("*")
                // 允许暴露所有响应头
                .exposedHeaders("*")
                // 允许凭证
                .allowCredentials(true)
                // 预检请求缓存时间
                .maxAge(3600);
    }
}