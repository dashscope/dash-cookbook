#!/usr/bin/env python3
# -*-coding:utf-8 -*-

"""
@File    :   base.py
@Date    :   2024-06-05
@Author  :   yuanci.ytb
@Version :   1.0.0
@License :   Copyright(C) 1999-2024, All rights Reserved, Designed By Alibaba Group Inc. 
@Desc    :   BaseModel
"""
from typing import Optional, Callable, Any

from pydantic import BaseModel as PydanticBaseModel


class BaseModel(PydanticBaseModel):
    def json(
            self,
            *,
            by_alias: bool = False,
            skip_defaults: Optional[bool] = None,
            exclude_unset: bool = False,
            exclude_defaults: bool = False,
            exclude_none: bool = False,
            encoder: Optional[Callable[[Any], Any]] = None,
            models_as_dict: bool = True,
            **dumps_kwargs: Any,
    ) -> str:
        return super().json(by_alias=True, ensure_ascii=False)

    class Config:
        allow_population_by_field_name = True
