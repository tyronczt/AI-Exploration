package com.english.learning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 安全配置类
 * 完全禁用Spring Security的所有功能，允许所有请求直接到达控制器
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // 完全禁用Spring Security
        http
            // 关闭CSRF保护
            .csrf().disable()
            // 允许所有请求访问
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().permitAll()
            )
            // 关闭所有Spring Security功能
            .formLogin().disable()
            .httpBasic().disable()
            .logout().disable()
            .exceptionHandling().disable()
            .sessionManagement().disable()
            // 移除所有过滤器
            .addFilterBefore((request, response, chain) -> chain.doFilter(request, response), SecurityFilterChain.class);

        return http.build();
    }
}