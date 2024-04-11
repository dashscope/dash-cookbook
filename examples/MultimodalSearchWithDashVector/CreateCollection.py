from dashvector import Client

# 如下填写您在1.2 准备工作中获取的DashVector API-KEY
DASHVECTOR_API_KEY = '{YOUR DashVector API-KEY}'
# 如下填写您在1.2 准备工作中获取的DashVector中Cluster中的Endpoint
DASHVECTOR_END_POINT = '{YOUR DashVector Endpoint}'

# 初始化DashVector 的client
client = Client(api_key=DASHVECTOR_API_KEY, endpoint=DASHVECTOR_END_POINT)

response = client.create(
    # Collection的名称，名称可自定义。这里暂时定义为：ImageTextSearch
    name='ImageTextSearch',
    # 创建Collection的维度，注意一定是1024维。因为后面我们会使用Chinese Clip模型进行embedding，Chinese Clip模型的输出维度是1024维。
    dimension=1024,
    # 距离度量方式一定为dotproduct，因为稀疏向量只支持dotproduc这种度量方式。
    metric='dotproduct',
    dtype=float,
    # 定义schema，通过schema可以定义Collection中包含哪些字段，以及字段的类型，以便实现更快速的搜索。这里定义了image_id、query和query_id三个schema。
    # 关于Schema的详细使用请参考：https://help.aliyun.com/document_detail/2510228.html
    fields_schema={'image_id': int, 'query': str, 'query_id': int}
)

print(response)
