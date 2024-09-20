package com.aliyun.chat.model;

import lombok.Data;
import java.io.Serializable;

/**
 * api接口的返回结果
 * @author yunchang
 */
@Data
public class Result<T> implements Serializable {
    private static final long serialVersionUID = -488730624643299315L;
    private boolean success = true;
    private String errorMsg;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setSuccess(true);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> error(String errorMsg) {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setErrorMsg(errorMsg);
        return result;
    }
}
