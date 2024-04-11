# 玩转多模态搜索

:::
本文主要介绍通过DashVector和ModelScope中的Chinese Clip模型实现文搜图、图搜图等功能，同时结合DashText SDK实现sparse
vector+dense vector混合检索，熟悉sparse vector的使用方法，提高检索效率。
:::

# 1 准备工作

## 1.1 基本概念

1. `Chinese Clip`：为[CLIP](https://arxiv.org/abs/2103.00020)模型的中文版本，使用大规模中文数据进行训练（**~2亿图文对**
   ），可用于图文检索和图像、文本的表征提取，应用于搜索、推荐等应用场景。详情请参考：[https://modelscope.cn/models/iic/multi-modal\_clip-vit-huge-patch14\_zh/summary](https://modelscope.cn/models/iic/multi-modal_clip-vit-huge-patch14_zh/summary)

2. `DashVector`：向量检索服务基于阿里云自研的向量引擎 Proxima 内核，提供具备水平拓展、全托管、云原生的高效向量检索服务。向量检索服务将强大的向量管理、查询等能力，通过简洁易用的
   SDK/API 接口透出，方便在大模型知识库搭建、多模态 AI
   搜索等多种应用场景上集成。详情请参考：[https://www.aliyun.com/product/ai/dashvector](https://www.aliyun.com/product/ai/dashvector)

3. `MUGE数据集`：MUGE（牧歌，Multimodal Understanding and Generation
   Evaluation）是业界首个大规模中文多模态评测基准，由达摩院联合浙江大学、阿里云天池平台联合发布，中国计算机学会计算机视觉专委会（CCF-CV专委）协助推出。目前包括： ·
   包含多模态理解与生成任务在内的多模态评测基准，其中包括图像描述、图文检索以及基于文本的图像生成。未来我们将公布更多任务及数据。 ·
   公开的评测榜单，帮助研究人员评估模型和追踪进展。
   MUGE旨在推动多模态表示学习进展，尤其关注多模态预训练。具备多模态理解和生成能力的模型均可以参加此评测，欢迎各位与我们共同推动多模态领域发展。详情请参考：[https://modelscope.cn/datasets/modelscope/muge/summary](https://modelscope.cn/datasets/modelscope/muge/summary)

4. `DashText`：是向量检索服务DashVector推荐使用的稀疏向量编码器（Sparse Vector
   Encoder），DashText可通过BM25算法将原始文本转换为稀疏向量（Sparse
   Vector）表达，通过DashText可大幅度简化使用DashVector[关键词感知检索](https://help.aliyun.com/document_detail/2586282.html)
   能力。详情请参考：[https://help.aliyun.com/document\_detail/2546039.html](https://help.aliyun.com/document_detail/2546039.html)

## 1.2 准备工作

1.
获取DashVector的API-KEY。API-KEY用于访问DashVector服务，详请参考：[https://help.aliyun.com/document\_detail/2510230.html](https://help.aliyun.com/document_detail/2510230.html)  
![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/vBPlNY8r93VROdG8/img/4208db5e-3fd8-42c0-9ae4-3a0877547b01.png)


2.
申请DashVector测试实例，DashVector提供免费试用实例，可以薅一波。详情请见：[https://help.aliyun.com/document\_detail/2568083.html](https://help.aliyun.com/document_detail/2568083.html)

3.
获取DashVector实例的endpoint，endpoint用于访问DashVector具体的实例。详情请见：[https://help.aliyun.com/document\_detail/2568084.html](https://help.aliyun.com/document_detail/2568084.html)  
![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/vBPlNY8r93VROdG8/img/c864c3f8-f8ea-4fce-bbae-18bd8c60d45c.png)

4. 安装DashVector、DashText、ModelScope的SDK

    pip install dashvector
    pip install dashtext
    pip install modelscope

由于安装ModelScope SDK需要一些依赖，继续安装，安装的时间有点长，请耐心等待~~~~~

    pip install decord
    pip install torch torchvision opencv-python timm librosa fairseq transformers unicodedata2 zhconv rapidfuzz

由于本教程中，会使用DashText的sdk生成稀疏向量，生成稀疏向量过程中会先下载一个词包，下载过程比较长。所以可以预先下载。

    wget https://dashvector-data.oss-cn-beijing.aliyuncs.com/public/sparsevector/bm25_zh_default.json

好啦，SDK和依赖都安装完了，下面简单介绍一下多模态搜索的过程。

## 1.3 多模态搜索过程

1. 多模态搜索分为两个过程，即索引过程和搜索过程。

2. 索引过程：本教程在索引过程中，使用MUGE数据集，数据格式如下。只需要对MUGE数据集中的图片和文本提取特征，然后将特征插入到DashVector中，就完成了索引过程。

    [{
        "query_id": "54372",
        "query": "金属产品打印",
        "image_id": "813904",
        "image": <PIL.PngImagePlugin.PngImageFile image mode=RGB size=224x224 at 0x7F8EB1F39DB0>
    },
    {
        "query_id": "78633",
        "query": "夹棉帽子",
        "image_id": "749842",
        "image": <PIL.PngImagePlugin.PngImageFile image mode=RGB size=224x224 at 0x7F8EB0AFFF70>
    }]

3. 搜索过程：通过对输入的文本或者图片，提取特征，并通过特征在DashVector中已经索引的向量中进行相似向量查询，并将查询后的结果解析成可视化的图片和文本，即完成了搜索过程。详情请看下图。

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/1GXn4BMEpYkMODQ4/img/9aa7722a-38fb-4543-b671-f300f045059f.jpeg)

# 2 创建DashVector Collection

    # Collection 名称为ImageTextSearch
    # 向量维度为 1024,
    # 距离度量方式一定为dotproduct，因为稀疏向量只支持dotproduc这种度量方式。
    python CreateCollection.py

好啦，Collection创建成功了。

# 3 图片和文本索引

1. 图片和文本插入，由于涉及到图片特征提取，所以速度会有点慢，建议使用GPU进行特征提取。

2. 采用Muge数据集，并对query图片进行sparse vector处理。

    python InsertImageAndText.py

3.
向量插入后，就可以在DashVector控制台看到向量啦！[https://dashvector.console.aliyun.com/cn-hangzhou/cluster/](https://dashvector.console.aliyun.com/cn-hangzhou/cluster/)

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/vBPlNY8r93VROdG8/img/4bbb40eb-766b-4a00-aee9-d16545a07857.png)

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/vBPlNY8r93VROdG8/img/d91b4608-d1f8-43ea-a8b8-66e9ce67d4e8.png)

# 4 图片和文本搜索

1. 图片插入成功后，即可进行图片和文本的跨模态搜索了，同样由于搜索过程中，涉及到图片特征提取，建议使用GPU进行。

2. 可以进行文搜图和图搜图操作。

    python SearchImageAndText.py

3. 搜索结果出来啦！

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/vBPlNY8r93VROdG8/img/38b2cac2-b2b2-4582-9416-8058281ef68c.png)