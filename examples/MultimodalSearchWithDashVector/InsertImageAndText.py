# 首先import一大堆东西
from modelscope.msdatasets import MsDataset
from modelscope.utils.constant import Tasks
from modelscope.pipelines import pipeline
import base64
import io
from dashvector import Client, Doc, DashVectorCode, DashVectorException
from dashtext import SparseVectorEncoder

# load 数据集,选取modelscope中的muge数据集，取数据集中validation部分
# muge数据集的格式为：
# [{
#     "query_id": "54372",
#     "query": "金属产品打印",
#     "image_id": "813904",
#     "image": <PIL.PngImagePlugin.PngImageFile image mode=RGB size=224x224 at 0x7F8EB1F39DB0>
# },
# {
#     "query_id": "78633",
#     "query": "夹棉帽子",
#     "image_id": "749842",
#     "image": <PIL.PngImagePlugin.PngImageFile image mode=RGB size=224x224 at 0x7F8EB0AFFF70>
# }]
# 首次load muge数据集有点慢，请耐心等待。
datasets = MsDataset.load("muge", split="validation")
# 获取数据集的长度，也就是数据集中有多少个这样的数据
datasets_len = len(datasets)

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


# 将图片转成字符串，用于将图片存储在dashvector中
def image_to_str(image):
    image_byte_arr = io.BytesIO()
    image.save(image_byte_arr, format='PNG')
    image_bytes = image_byte_arr.getvalue()
    return base64.b64encode(image_bytes).decode()


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


# 通过dashtext对文本生成稀疏向量。注意，本函数为生成入库的稀疏向量，而不是query的稀疏向量
def sparse_vector_documents(text):
    # 通过dashtext生成稀疏向量
    sparse_vector = encoder.encode_documents(text)
    return sparse_vector if isinstance(text, list) else sparse_vector


# 插入向量数据，batch_size默认为10，最大不超过20
def insert_docs(collection_name: str, partition='default', batch_size=10):
    idx = 0
    while idx < datasets_len:
        # 获取batch range数据
        batch_range = range(idx, idx + batch_size) if idx + batch_size < datasets_len else range(idx, datasets_len)

        # 获取image信息
        images = [datasets[i]['image'] for i in batch_range]
        # 通过Chinese Clip提取图片特征，返回为一个vector
        images_vector = image_vector(images)

        # 获取query信息
        texts = [datasets[i]['query'] for i in batch_range]
        # 生成稀疏向量
        documents_sparse_vector = sparse_vector_documents(texts)

        # 获取图片ID和query ID
        images_ids = [datasets[i]['image_id'] for i in batch_range]
        query_ids = [datasets[i]['query_id'] for i in batch_range]

        # 获取Collection
        collection = client.get(collection_name)
        # 批量插入
        response = collection.upsert(
            [
                Doc(
                    id=image_id,
                    vector=img_vector,
                    sparse_vector=document_sparse_vector,
                    fields={
                        # 由于在创建Collection时，image_id和query_id都是int类型，所以这里需要转换为int类型
                        'image_id': int(image_id),
                        'query_id': int(query_id),
                        'query': query,
                        # 将Image格式转成字符串，用于存储在dashvector中
                        'image': image_to_str(image)
                    }
                ) for img_vector, document_sparse_vector, image_id, query_id, image, query in
                zip(images_vector, documents_sparse_vector, images_ids, query_ids, images, texts)
            ]
        )
        print(response)
        idx += batch_size

    return response


if __name__ == '__main__':
    # 插入数据，batch_size最大20
    response = insert_docs(collection_name='ImageTextSearch', batch_size=20)
