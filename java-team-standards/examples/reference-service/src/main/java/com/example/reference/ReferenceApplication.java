package com.example.reference;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** 只读组织查询参考工程的启动入口。 */
@SpringBootApplication
public class ReferenceApplication {
    /**
     * 启动本机只读参考服务，由 Spring 加载接口、校验和安全配置。
     *
     * @param args Spring Boot 启动参数，例如服务端口
     */
    public static void main(String[] args) {
        SpringApplication.run(ReferenceApplication.class, args);
    }
}
