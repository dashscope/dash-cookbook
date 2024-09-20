package com.aliyun.chat.controller;


import com.aliyun.chat.config.BailianConfig;
import com.aliyun.chat.model.ChatHistory;
import com.aliyun.chat.model.GenerationInMsg;
import com.aliyun.chat.model.GenerationOutMsg;
import com.aliyun.chat.model.Result;
import com.aliyun.chat.service.ChatHistoryService;
import io.reactivex.Flowable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import javax.annotation.Resource;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import reactor.core.publisher.Mono;

/**
 * 模型对话控制器
 * @author yunchang
 */
@RestController
@RequestMapping("/model")
@CrossOrigin(origins = "*")
public class ModelController {
    private static final Logger logger = LoggerFactory.getLogger(ModelController.class);

    @Resource
    private BailianConfig bailianConfig;

    @Autowired
    private ChatHistoryService chatHistoryService;

    @RequestMapping(value = "/generation", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Result<GenerationOutMsg>> generation(@RequestBody GenerationInMsg inMsg) {
        try {
            //缓存用户输入内容
            ChatHistory userChatHistory = new ChatHistory();
            userChatHistory.setRole(Role.USER.getValue());
            userChatHistory.setContent(inMsg.getPrompt());
            chatHistoryService.save(inMsg.getSessionId(), userChatHistory);

            List<Message> messages = new ArrayList<>();
            //导入系统消息
            if(!inMsg.getSystemMessage().isEmpty()) {
                messages.add(Message.builder().role(Role.SYSTEM.getValue()).content(inMsg.getSystemMessage()).build());
            }

            //从缓存中导入历史消息
            List<ChatHistory> chatHistories = chatHistoryService.load(inMsg.getSessionId());
            for(ChatHistory chatHistory : chatHistories) {
                messages.add(Message.builder().role(chatHistory.getRole()).content(chatHistory.getContent()).build());
            }

            //配置参数
            GenerationParam param = GenerationParam.builder()
                    .workspace(bailianConfig.getWorkspace())
                    .apiKey(bailianConfig.getApiKey())
                    .model(inMsg.getModelId())
                    .messages(messages)
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .topP(0.8)
                    .incrementalOutput(false)
                    .build();

            //流式生成
            Generation gen = new Generation();
            Flowable<GenerationResult> generationResult = gen.streamCall(param);

            return Flux.from(generationResult)
                    .map(data -> handGenerationResult(data, inMsg.getSessionId()))
                    .onErrorResume(this::handleGenerationError)
                    .doOnComplete(this::handleGenerationComplete);
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            logger.error(e.getMessage());
            Result<GenerationOutMsg> result = Result.error(e.getMessage());
            return Flux.just(result);
        }
    }

    private Result<GenerationOutMsg> handGenerationResult(GenerationResult generationResult, String sessionId) {
        if(generationResult == null) {
            return null;
        }
        logger.info(String.valueOf(generationResult));

        GenerationOutMsg generationOutMsg = new GenerationOutMsg();
        generationOutMsg.setFinishReason(generationResult.getOutput().getChoices().get(0).getFinishReason());
        generationOutMsg.setText(generationResult.getOutput().getChoices().get(0).getMessage().getContent());

        //缓存存储智能体输出内容
        if(Objects.equals(generationOutMsg.getFinishReason(), "stop")) {
            ChatHistory assistantChatHistory = new ChatHistory();
            assistantChatHistory.setRole(Role.ASSISTANT.getValue());
            assistantChatHistory.setContent(generationOutMsg.getText());
            chatHistoryService.save(sessionId, assistantChatHistory);
        }

        return Result.success(generationOutMsg);
    }

    private Mono<Result<GenerationOutMsg>> handleGenerationError(Throwable t) {
        Result<GenerationOutMsg> result = Result.error(t.getMessage());
        return Mono.just(result);
    }

    private void handleGenerationComplete() {
        logger.info("handle Generation Complete!");
    }
}
