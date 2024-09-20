package com.aliyun.chat.model;

import lombok.Data;
import java.io.Serializable;

/**
 * 模型对话的聊天记录
 * @author yunchang
 */
@Data
public class ChatHistory implements Serializable {
    //角色，例如：user、assistant、system
    private String role;
    //对话内容
    private String content;
}
