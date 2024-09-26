# 介绍

本项目展示了百炼大模型在AI客服领域的应用。

# 准备

运行该工程需要准备的资源包括：   
1、Python 3.10开发环境   
2、MySQL数据库  
3、注册阿里云百炼账号，并获取api_key  
4、上传documents目录中的产品手册至百炼数据中心，请参考introduce.md  

# 运行

1、git克隆该项目到本地  
2、跳转到backend目录，运行pip install -r requirements.txt以安装所有依赖项  
3、打开config.py文件，配置百炼api_key以及mysql数据库的url  
4、控制台输入python server.py，以运行后端web服务  
5、控制台输入python tools.py，向数据库添加业务数据  
6、浏览器输入网址http://127.0.0.1:5000，即可体验  
