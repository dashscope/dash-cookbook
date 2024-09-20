## 介绍
阿里云百炼平台应用对话与模型对话的简单示例，应用对话历史记录由云端托管，而模型对话历史记录需要开发者自己处理，本工程使用Caffeine本地缓存。

## Jar编译及运行
```
cd build
./build.sh
java -jar chat.jar --spring.config.location=application.yml
```

## Docker编译及运行
```
cd build
./build.sh docker
docker run -d -p 8080:8080 -v ./application.yml:/root/application.yml chat-sample:1.0.1
```

## application.yml文件配置
```
server:
  port: 8080

spring:
  mvc:
    view:
      prefix: classpath:/templates/
      suffix: .html

bailian:
  workspace:
  appId: 
  apiKey: 
```
bailian.workspace表示百炼业务空间，选填项，若不填则为默认业务空间。   
bailian.appId表示百炼应用Id，选填项，也可通过web页面配置，若web配置为空则取该项配置。   
bailian.apikey表示百炼平台密钥，必填项，在百炼控制台可获取。
