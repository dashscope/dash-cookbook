package com.aliyun.chat.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

/**
 * 应用对话完成情况的输入参数
 * @author yunchang
 */
@Data
@SuperBuilder
@NoArgsConstructor
public class CompletionsInMsg implements Serializable {
    //用户输入内容
    private String prompt;
    //应用ID
    private String appId;
    //会话ID，由服务端生成并返回
    private String sessionId;
}
