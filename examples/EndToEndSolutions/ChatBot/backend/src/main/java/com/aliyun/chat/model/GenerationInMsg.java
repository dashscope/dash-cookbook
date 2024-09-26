package com.aliyun.chat.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

/**
 * 模型对话生成情况的输入参数
 * @author yunchang
 */
@Data
@SuperBuilder
@NoArgsConstructor
public class GenerationInMsg implements Serializable {
    //用户输入内容
    private String prompt;
    //模型ID，例如：qwen-max、qwen-turbo、qwen-plus
    private String modelId;
    //系统级消息，用于指导模型按照预设的规范、角色或情境进行回应
    private String systemMessage;
    //会话ID，用于查询对话记录，由客户端随机生成
    private String sessionId;
}
