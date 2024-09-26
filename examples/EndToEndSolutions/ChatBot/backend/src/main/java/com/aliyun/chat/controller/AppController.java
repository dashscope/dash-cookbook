package com.aliyun.chat.controller;


import com.aliyun.chat.config.BailianConfig;
import com.aliyun.chat.model.CompletionsInMsg;
import com.aliyun.chat.model.CompletionsOutMsg;
import com.aliyun.chat.model.Result;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.alibaba.dashscope.app.*;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import io.reactivex.Flowable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 应用对话控制器
 * @author yunchang
 */
@RestController
@RequestMapping("/app")
@CrossOrigin(origins = "*")
public class AppController {
    private static final Logger logger = LoggerFactory.getLogger(AppController.class);

    @Resource
    private BailianConfig bailianConfig;

    @RequestMapping(value = "/completions", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Result<CompletionsOutMsg>> completions(@RequestBody CompletionsInMsg inMsg) {
        try {
            String appId = inMsg.getAppId().isEmpty() ? bailianConfig.getAppId() : inMsg.getAppId();

            ApplicationParam param = ApplicationParam.builder()
                    .workspace(bailianConfig.getWorkspace())
                    .appId(appId)
                    .apiKey(bailianConfig.getApiKey())
                    .sessionId(inMsg.getSessionId())
                    .prompt(inMsg.getPrompt())
                    .build();

            Application application = new Application();
            Flowable<ApplicationResult> applicationResult = application.streamCall(param);

            return Flux.from(applicationResult)
                    .map(this::handleCompletionsResult)
                    .onErrorResume(this::handleCompletionsError)
                    .doOnComplete(this::handleCompletionsComplete);

        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            logger.error(e.getMessage());

            Result<CompletionsOutMsg> result = Result.error(e.getMessage());
            return Flux.just(result);
        }
    }

    private Result<CompletionsOutMsg> handleCompletionsResult(ApplicationResult applicationResult) {
        if(applicationResult == null) {
            return null;
        }

        logger.info(String.valueOf(applicationResult));

        CompletionsOutMsg completionsOutMsg = new CompletionsOutMsg();
        completionsOutMsg.setSessionId(applicationResult.getOutput().getSessionId());
        completionsOutMsg.setText(applicationResult.getOutput().getText());
        completionsOutMsg.setFinishReason(applicationResult.getOutput().getFinishReason());

        return Result.success(completionsOutMsg);
    }

    private Mono<Result<CompletionsOutMsg>> handleCompletionsError(Throwable t) {
        Result<CompletionsOutMsg> result = Result.error(t.getMessage());
        return Mono.just(result);
    }

    private void handleCompletionsComplete() {
        logger.info("handle completions Complete!");
    }
}