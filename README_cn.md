<p align="center">
    <h1>Dash-CookBook</h1>
<p>

简体中文 | [English](./README.md)

# 简介

Dash-CookBook是一个基于DashScope API和阿里云百炼平台，分享各类应用的最佳实践和应用案例的Github项目。
大部分代码示例基于python语言，更多语言版本，可以参考[官方文档](https://help.aliyun.com/document_detail/2400264.html?spm=a2c4g.2400256.0.0.37807b3b5VzvnK)。


## 🚀 阿里云灵积
[DashScope灵积](https://dashscope.aliyun.com/)提供灵活、易用的模型API服务，包括通义系列、开源社区和第三方合作伙伴提供的LLM、文生图、Embedding、语音等模型服务。
通过灵积API，开发者不仅可以直接集成大模型的强大能力，也可以对模型进行训练微调，实现模型定制化。


## 🚀 阿里云百炼

[阿里云百炼](https://bailian.console.aliyun.com/#/home)是基于通义大模型、行业大模型以及三方大模型的一站式大模型开发平台。
底层依赖[DashScope API](https://dashscope.aliyun.com/)服务。
面向企业客户和个人开发者，提供完整的模型服务工具和全链路应用开发套件，预置丰富的能力插件，
提供API及SDK等便捷的集成方式，高效完成大模型应用构建。

## 🚀 DashVector

[向量检索服务DashVector](https://www.aliyun.com/activity/intelligent/DashVector)
是一个全托管向量数据库服务，支持高维稀疏向量检索，实时数据插入和查询过滤。
支持自动弹性扩容，并且满足多样化的应用需求，可广泛应用于大模型搜索、多模态搜索、AI搜索、分子结构分析等AI检索场景。
现阶段，DashVector支持在🦜️🔗[LangChain](https://python.langchain.com/docs/integrations/vectorstores/dashvector)和
[LlamaIndex](https://docs.llamaindex.ai/en/stable/examples/vector_stores/DashvectorIndexDemo/)社区进行使用。


# ✨Examples
以下是利用上述提到的平台和API能力，创建的一些最佳实践。大部分案例可以通过PAI-DSW和Colab进行打开，填写API-KEY后即可运行。


- LLM基础调用: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/models/call_model.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/models/call_model.ipynb)

- 基于文本向量和Dash Vector实现语义检索: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/examples/basic_semantic_search.ipynb) [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/examples/basic_semantic_search.ipynb)

- 基于LLM和Vector DB构建知识库QA应用:  [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/examples/vectorDB_enhanced_QA_with_LLM.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/examples/vectorDB_enhanced_QA_with_LLM.ipynb)

- 微调LLM实现广告文案生成: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/examples/finetune_LLM_for_advertisement_generation_sdk_api.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/examples/finetune_LLM_for_advertisement_generation_sdk_api.ipynb)

- 基于LLM改写后的Prompt生成高质量图片:   [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/examples/image_generation_with_LLM_enhanced_prompt.ipynb) [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/examples/image_generation_with_LLM_enhanced_prompt.ipynb)

- 基于API&SDK调用百炼平台创建的智能体应用: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/apps/call_application.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/apps/call_application.ipynb)
- 基于Assistant API创建智能体:
  - Assistant API基础用例: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/assistants/assistant_api_usage.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/assistants/assistant_api_usage.ipynb)
  - Assistant API最佳实践 - 旅游出行助手: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/assistants/assistant_api_demo.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/assistants/assistant_api_demo.ipynb)
  - Assistant API最佳实践 - 百炼官方文档助手: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/assistants/assistant_api_with_rag.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/assistants/assistant_api_with_rag.ipynb)
  - Assistant API最佳实践 - 多智能体应用: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/assistants/assistant_api_multi_agent.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/assistants/assistant_api_multi_agent.ipynb)
- 构建知识库检索应用:
  - 基于百炼平台知识库应用快速构建: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/rags/rag_quick_start.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/rags/rag_quick_start.ipynb)
  - 基于LlamaIndex SDK构建RAG应用: [![Open In PAI-DSW](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/Open-in-DSW20px.svg)](https://gallery.pai-ml.com/#/import/https://github.com/dashscope/dash-cookbook/blob/main/rags/build_rag_with_llama_index.ipynb)  [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dashscope/dash-cookbook/blob/main/rags/build_rag_with_llama_index.ipynb)

## 💁Contributing

如果您对于代码示例有任何问题，欢迎在[open an issue](https://github.com/dashscope/dash-cookbook/issues)页面提交问题。
同样，也期待更多的代码示例贡献到Dash-Cookbook项目，可以参考现有的代码示例，提交Pull Request即可。


