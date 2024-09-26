package com.aliyun.chat.service;

import com.aliyun.chat.model.ChatHistory;
import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

/**
 * 模型对话的聊天记录服务
 * @author yunchang
 */
@Service
public class ChatHistoryService {

    @Autowired
    private Cache<String, List<ChatHistory>> chatHistoryCache;

    public void save(String sessionId, ChatHistory chatHistory) {
        List<ChatHistory> chatHistories = chatHistoryCache.getIfPresent(sessionId);
        if(chatHistories == null) {
            chatHistories = new ArrayList<>();
        }

        chatHistories.add(chatHistory);
        chatHistoryCache.put(sessionId, chatHistories);
    }

    public List<ChatHistory> load(String sessionId) {
        return chatHistoryCache.getIfPresent(sessionId);
    }
}
