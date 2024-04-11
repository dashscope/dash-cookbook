# 老规矩，先import一堆东西
from modelscope.utils.constant import Tasks
from modelscope.preprocessors.image import load_image
from modelscope.pipelines import pipeline
from PIL import Image
import base64
import io
from dashvector import Client, Doc, DashVectorCode, DashVectorException
from dashtext import SparseVectorEncoder, combine_dense_and_sparse
from urllib.parse import urlparse

# 初始化ModelScope推理pipeline，本教程使用Chinese Clip作为embedding模型。由于图片的Embedding比较消耗计算资源，所以推荐使用GPU进行推理加速。
# 请参考：https://modelscope.cn/models/iic/multi-modal_clip-vit-huge-patch14_zh/summary
pipeline = pipeline(task=Tasks.multi_modal_embedding,
                    model='damo/multi-modal_clip-vit-huge-patch14_zh', model_revision='v1.0.0')

# 初始化稀疏向量编码器，用于对muge数据集中的query进行稀疏向量编码，中文编码。详情请参考：https://help.aliyun.com/document_detail/2546039.html
encoder = SparseVectorEncoder()
# encoder初始化的时间比较长，主要原因在于稀疏向量编码器需要加载一个json文件，该文件比较大，需要下载。我们可以先下载完，保存在本地，直接加载，速度会快很多。
# 下载链接：https://dashvector-data.oss-cn-beijing.aliyuncs.com/public/sparsevector/bm25_zh_default.json
# 也可以使用：wget https://dashvector-data.oss-cn-beijing.aliyuncs.com/public/sparsevector/bm25_zh_default.json，直接下载到本地。
# 下载完成后，放在本机目录中，本教程已经下载完成，放在根目录下。
encoder_path = 'bm25_zh_default.json'
encoder.load(encoder_path)

# 如下填写您在1.2 准备工作中获取的DashVector API-KEY
DASHVECTOR_API_KEY = '{YOUR DashVector API-KEY}'
# 如下填写您在1.2 准备工作中获取的DashVector中Cluster中的Endpoint
DASHVECTOR_END_POINT = '{YOUR DashVector Endpoint}'

# 初始化dashvector的Client，用于访问dashvector服务
# 请参考：https://help.aliyun.com/document_detail/2510240.html
client = Client(api_key=DASHVECTOR_API_KEY, endpoint=DASHVECTOR_END_POINT)


# 将字符串转为图片
def str2image(image_str):
    image_bytes = base64.b64decode(image_str)
    return Image.open(io.BytesIO(image_bytes))


# 判断是否为URL
def is_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False


# 通过Chinese Clip提取图片特征，并转成向量
def image_vector(image):
    # 通过Chinese Clip提取图片特征，返回为一个tensor
    img_embedding = pipeline.forward({'img': image})['img_embedding']
    # 将返回的tensor转成向量,向量需要转存到cpu中
    img_vector = img_embedding.detach().cpu().numpy()
    return img_vector if isinstance(image, list) else img_vector[0]


# 通过Chinese Clip提取文本特征，并转成向量
def text_vector(text):
    # 通过Chinese Clip提取文本特征，返回为一个tensor
    text_embedding = pipeline.forward({'text': text})['text_embedding']
    # 将返回的tensor转成向量,向量需要转存到cpu中
    text_vector = text_embedding.detach().cpu().numpy()
    return text_vector if isinstance(text, list) else text_vector[0]


# 通过dashtext对文本生成稀疏向量。注意，本函数为query的稀疏向量，而不是入库的稀疏向量
def sparse_vector_queries(text):
    # 通过dashtext生成稀疏向量
    sparse_vector = encoder.encode_queries(text)
    return sparse_vector if isinstance(text, list) else sparse_vector


# 通过文本和图片搜索图片，返回搜索结果。其中，文本会转换为稀疏向量，图片会转换成稠密向量，并通过alpha值控制稠密向量和稀疏向量的权重，alpha=1.0则全部使用稠密向量搜索，alpha=0.0则全部使用稀疏向量搜索
def serach_by_imageAndtext(query_text, query_image, collection_name, partition='default', top_k=10, alpha=0.5):
    if is_url(query_image):
        query_image = load_image(query_image)
    image_embedding = image_vector(query_image)
    query_sparse_embedding = sparse_vector_queries(query_text)
    scaled_dense_vector, scaled_sparse_vector = combine_dense_and_sparse(image_embedding, query_sparse_embedding, alpha)
    try:
        collection = client.get(name=collection_name)
        # 搜索
        docs = collection.query(
            vector=scaled_dense_vector,
            sparse_vector=scaled_sparse_vector,
            partition=partition,
            topk=top_k,
            output_fields=['image', 'query', 'image_id']
        )

        image_list = list()
        for doc in docs:
            image_str = doc.fields['image']
            print(doc.score)
            # print(doc.fields['query'])
            # print(doc.fields['image_id'])
            image_list.append(str2image(image_str))
        return image_list

    except DashVectorException as e:
        print(e)
        return []


# 通过文本搜索图片，返回搜索结果，并将文本变成对应的稀疏向量和稠密向量，稀疏向量用来控制文本中是否包含该关键词，稠密向量用于控制图片中是否包含此信息。可通过alpha值控制稠密向量和稀疏向量的权重，alpha=1.0则全部使用稠密向量搜索，alpha=0.0则全部使用稀疏向量搜索
def search_by_text(query_text, collection_name, partition='default', top_k=10, alpha=0.5):
    query_embedding = text_vector(query_text)
    query_sparse_embedding = sparse_vector_queries(query_text)
    scaled_dense_vector, scaled_sparse_vector = combine_dense_and_sparse(query_embedding, query_sparse_embedding, alpha)
    try:
        collection = client.get(name=collection_name)
        # 搜索
        docs = collection.query(
            vector=scaled_dense_vector,
            sparse_vector=scaled_sparse_vector,
            partition=partition,
            topk=top_k,
            output_fields=['image', 'query', 'image_id']
        )

        image_list = list()
        for doc in docs:
            image_str = doc.fields['image']
            print(doc.score)
            # print(doc.fields['query'])
            # print(doc.fields['image_id'])
            image_list.append(str2image(image_str))
        return image_list

    except DashVectorException as e:
        print(e)
        return []


if __name__ == '__main__':
    query_text = '女士帽子'
    query_image = 'https://viapi-aistore-2.oss-cn-shanghai.aliyuncs.com/dashvector/O1CN01XjQLIb2JjMX6sVhn7_!!2217497569457-0-cib.jpg?OSSAccessKeyId=LTAI5tLRnkQsKsPDmaEqcFnA&Expires=2072648960&Signature=%2BR9ntAyvmylLUXeYxgmJ8ur03WE%3D'
    # response = search_by_text(query_text=query_text, collection_name='ImageTextSearch', alpha=0.4,top_k=20)
    response = serach_by_imageAndtext(query_text=query_text, query_image=query_image, collection_name='ImageTextSearch',
                                      top_k=20, alpha=0.3)
    for image in response:
        display(image)
