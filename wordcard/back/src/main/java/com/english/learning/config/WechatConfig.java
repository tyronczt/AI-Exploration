package com.english.learning.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WechatConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @ConfigurationProperties(prefix = "spring.wechat")
    @Bean
    public WechatProperties wechatProperties() {
        return new WechatProperties();
    }
    
    public static class WechatProperties {
        private String appid;
        private String appsecret;
        private String jscode2sessionUrl;
        
        // Getters and setters
        public String getAppid() {
            return appid;
        }
        
        public void setAppid(String appid) {
            this.appid = appid;
        }
        
        public String getAppsecret() {
            return appsecret;
        }
        
        public void setAppsecret(String appsecret) {
            this.appsecret = appsecret;
        }
        
        public String getJscode2sessionUrl() {
            return jscode2sessionUrl;
        }
        
        public void setJscode2sessionUrl(String jscode2sessionUrl) {
            this.jscode2sessionUrl = jscode2sessionUrl;
        }
    }
}