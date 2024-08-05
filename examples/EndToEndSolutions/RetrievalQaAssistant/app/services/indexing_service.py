#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   indexing_service.py
@Date    :   2024-06-06
@Author  :   linkesheng.lks
@Version :   1.0.0
@License :   Copyright(C) 1999-2024, All rights Reserved, Designed By Alibaba Group Inc.
@Desc    :   indexing service logic
"""
import os
import re
import time
from typing import Optional
from datetime import datetime
import traceback
import asyncio
from typing import List

from llama_index.indices.managed.dashscope import DashScopeCloudIndex
from llama_index.readers.dashscope import DashScopeParse, ResultType
from playwright.async_api import async_playwright
from urllib.parse import urljoin

from settings import settings
from app.common.log import log
from app.common.item import Metadata, SqliteManager as ItemManager


class IndexingService:
    def __init__(self):
        self.doc_cate_id = settings.INDEXING_DOC_CATE_ID
        self.index_name = settings.INDEXING_REPO_NAME
        self.resource_url = settings.INDEXING_ROOT_URL
        self.resource_selector = settings.INDEXING_ROOT_SELECTOR
        # self.item_manager = ItemManager(settings.INDEXING_DB_HOST, settings.INDEXING_DB_USER,
        #                                 settings.INDEXING_DB_PASSWORD, settings.INDEXING_DB_SCHEMA)
        self.item_manager = ItemManager(settings.INDEXING_DB_PATH)

    async def run(self, restart: bool = False, times: int = 0, doc_cate_id: Optional[str] = None,
                  index_name: Optional[str] = None, resource_url: Optional[str] = None,
                  resource_selector: Optional[str] = None) -> None:
        """运行Indexing Service"""
        log.info("run indexing service: restart=%s, times=%d" % (restart, times))
        try:
            os.makedirs(settings.INDEXING_FILE_DIR, exist_ok=True)
            log.info("created indexing file dir successfully: %s" % settings.INDEXING_FILE_DIR)
        except Exception as e:
            log.error("failed to create indexing file dir: dir=%s, err=%s" %
                      settings.INDEXING_FILE_DIR, traceback.format_exc())
            raise e

        if restart:
            # 全量更新模式下，删除原有文档记录
            all_items = self.item_manager.get_all()
            if all_items:
                doc_ids = [item.doc_id for item in all_items]
                index = DashScopeCloudIndex(name=self.index_name)
                try:
                    index.delete_ref_doc(ref_doc_ids=doc_ids)
                except Exception:
                    log.warning("delete all doc exceptionally")
                self.item_manager.destroy_table()
                log.info("delete all docs")
        self.item_manager.create_table()

        # 如果times为0，则循环执行更新操作
        if times == 0:
            await self.__periodic_task(settings.INDEXING_UPDATE_INTERVAL, self.__update, doc_cate_id, index_name,
                                       resource_url, resource_selector)
        else:
            for i in range(times):
                log.info("update times: %d" % i)
                await self.__update(doc_cate_id, index_name, resource_url, resource_selector)


    async def __update(self, doc_cate_id: Optional[str], index_name: Optional[str], resource_url: Optional[str],
                       resource_selector: Optional[str]) -> None:
        """更新知识库"""
        log.info("update index begin")
        if doc_cate_id:
            self.doc_cate_id = doc_cate_id
            log.info("set doc cate id: %s" % doc_cate_id)

        if index_name:
            self.index_name = index_name
            log.info("set index name: %s" % index_name)

        if resource_url:
            self.resource_url = resource_url
            log.info("set resource url: %s" % resource_url)

        if resource_selector:
            self.resource_selector = resource_selector
            log.info("set resource selector: %s" % resource_selector)

        all_items = await self.__extract_all_items(self.resource_url, self.resource_selector)

        log.info("items number: %d" % len(all_items))

        await self.__create_index(all_items)
        log.info("update index end")

    async def __expand_ul(self, page, ul_element):
        """递归展开目录"""
        if not ul_element:
            raise ValueError(f"No element found for ul element: {ul_element}")

        # 获取ul下的第一层li
        li_elements = await ul_element.query_selector_all(':scope > li')

        for li in li_elements:
            li_id = await li.get_attribute('id')
            if li_id and li_id in settings.INDEXING_EXCLUDED_IDS:
                log.info("exclude li id: %s" % li_id)
                continue
            # 获取li下的第一层a
            a_elements = await li.query_selector_all(':scope > a')
            for a in a_elements:
                i_elements = await a.query_selector_all('i')
                if i_elements:
                    for i in i_elements:
                        i_class = await i.get_attribute('class')
                        # 仅展开关闭的箭头
                        if 'icon-close-arrow' in i_class:
                            await i.click()
                            await page.wait_for_timeout(50)

            child_ul_elements = await li.query_selector_all('ul')
            if child_ul_elements:
                for child_ul in child_ul_elements:
                    await self.__expand_ul(page, child_ul)

    @staticmethod
    async def __get_update_time(page) -> Optional[str]:
        """获取更新时间"""
        update_time_element = await page.query_selector(settings.INDEXING_TIME_TAG)
        if update_time_element:
            text = await update_time_element.text_content()
            time_matches = re.search(settings.INDEXING_TIME_PATTERN, text)
            if time_matches:
                return time_matches.group(0)
        return None

    async def __extract_all_items(self, url, root_ul_selector) -> List[Metadata]:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url)

            # 展开根目录下的所有子目录
            root_ul_element = await page.query_selector(root_ul_selector)
            await self.__expand_ul(page, root_ul_element)

            await page.wait_for_timeout(1000)

            # 提取所有a元素下的目标信息并保存
            a_elements = await root_ul_element.query_selector_all('a')
            items: List[Metadata] = []
            for a in a_elements:
                if await a.get_attribute('href'):
                    href = await a.get_attribute('href')
                    url = urljoin(page.url, href)
                    id = await a.get_attribute('id')
                    title = id
                    span_elements = await a.query_selector_all('span')
                    if span_elements:
                        title = await span_elements[0].inner_text()
                    items.append(Metadata(id=id, title=title, update_time=None, local_path=None, remote_url=url))

            await browser.close()

            return items

    async def __create_index(self, new_items: List[Metadata]):
        items_to_insert: List[Metadata] = []
        items_to_delete: List[Metadata] = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            num_new_items = len(new_items)
            for idx, new in enumerate(new_items):
                file_name = new.id + '_' + new.title + '.pdf'
                new.local_path = os.path.join(settings.INDEXING_FILE_DIR, file_name)
                await page.goto(new.remote_url)
                new.update_time = await self.__get_update_time(page)
                old = self.item_manager.get(new.id)
                if not old:
                    items_to_insert.append(new)
                else:
                    new_update_time = datetime.strptime(new.update_time, settings.INDEXING_TIME_FORMAT)
                    old_update_time = datetime.strptime(old.update_time, settings.INDEXING_TIME_FORMAT)
                    if new_update_time > old_update_time:
                        items_to_insert.append(new)
                        items_to_delete.append(old)
                    else:
                        log.info("skip generate local file[%d/%d]: id=%s, current_update_time=%s, last_update_time=%s" %
                                 (idx + 1, num_new_items, new.id, new.update_time, old.update_time))
                        continue
                await page.pdf(path=new.local_path, format='A3')
                log.info("generate local file[%d/%d]: %s" % (idx + 1, num_new_items, new))
            await browser.close()

        old_items = self.item_manager.get_all()
        if old_items:
            new_ids = [item.id for item in new_items]
            for old in old_items:
                if old.id not in new_ids:
                    items_to_delete.append(old)

        index = DashScopeCloudIndex(name=self.index_name)

        # 删除旧文档
        if items_to_delete:
            num_items = len(items_to_delete)
            log.info("delete doc begin: num=%d" % num_items)
            doc_ids = [item.doc_id for item in items_to_delete]
            index.delete_ref_doc(ref_doc_ids=doc_ids)
            log.info("delete doc end: num=%d" % num_items)
            for item in items_to_delete:
                self.item_manager.delete(item.id)

        # 添加新文档
        if items_to_insert:
            num_items = len(items_to_insert)
            parse = DashScopeParse(result_type=ResultType.DASHSCOPE_DOCMIND,
                                   category_id=self.doc_cate_id,
                                   verbose=False)
            files_to_load = [item.local_path for item in items_to_insert]
            log.info("load data begin: num=%d" % num_items)
            documents = await parse.aload_data(file_path=files_to_load)
            log.info("load data end: num=%d" % len(documents))
            log.info("insert doc begin: num=%d" % num_items)
            # 尝试直接插入文档，若失败则用from_documents接口，后者支持创建知识库
            try:
                index._insert(documents=documents)
            except Exception:
                log.warning("insert doc failed, try to create index and upload")
                index = DashScopeCloudIndex.from_documents(
                    documents=documents,
                    name=self.index_name,
                    verbose=True,
                )
            log.info("insert doc end: num=%d" % num_items)
            for idx, document in enumerate(documents):
                items_to_insert[idx].doc_id = document.doc_id
                item = items_to_insert[idx]
                self.item_manager.add(item)
                os.remove(item.local_path)

    @staticmethod
    async def __periodic_task(interval, action, *args):
        """循环运行任务"""
        next_run_time = time.time() + interval
        while True:
            await action(*args)
            current_time = time.time()
            sleep_time = max(0, next_run_time - current_time)
            await asyncio.sleep(sleep_time)
            next_run_time += interval


indexing_service = IndexingService()

if __name__ == "__main__":
    asyncio.run(indexing_service.run(restart=True,
                                     times=1,
                                     doc_cate_id=settings.INDEXING_DOC_CATE_ID,
                                     index_name=settings.INDEXING_REPO_NAME,
                                     resource_url=settings.INDEXING_ROOT_URL,
                                     resource_selector=settings.INDEXING_ROOT_SELECTOR))

    log.info("run indexing successfully")
