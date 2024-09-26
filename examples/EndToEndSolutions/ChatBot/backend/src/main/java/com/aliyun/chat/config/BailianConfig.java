package com.aliyun.chat.config;

import lombok.Data;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 百炼账号配置
 * @author yunchang
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "bailian")
public class BailianConfig {
    private String workspace;
    private String appId;
    private String apiKey;
}
