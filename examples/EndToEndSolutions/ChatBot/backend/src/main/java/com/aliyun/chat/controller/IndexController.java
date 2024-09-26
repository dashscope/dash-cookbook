package com.aliyun.chat.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;

import org.springframework.ui.Model;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * 主页控制器
 * @author yunchang
 */
@Controller
@CrossOrigin(origins = "*")
public class IndexController {
    @RequestMapping(value = "/")
    public String index(HttpServletRequest request, HttpServletResponse response, Model model) {
        return "index.html";
    }
}
