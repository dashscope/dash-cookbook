### 百炼答疑机器人

##### 安装依赖
```
pip install -r requirements.txt
```

##### 修改配置
```
修改settings.py中配置项
```

##### 编译打包

```
./build.sh
```

##### 启动和运行

```
cd build/bailian-support/target/bailian-support

env DASHSCOPE_API_KEY=sk-*** gunicorn --timeout 300 --config gunicorn.py main:app
```

##### 测试页面
http://localhost:8080/