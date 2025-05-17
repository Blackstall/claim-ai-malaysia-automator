##
#   Copyright 2021 Alibaba, Inc. and its affiliates. All Rights Reserved.
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
##

# -*- coding: utf-8 -*-

import re

from dashvector.common.constants import *
from dashvector.common.handler import RPCRequest
from dashvector.common.types import *
from dashvector.core.proto import dashvector_pb2


class CreateCollectionRequest(RPCRequest):
    def __init__(
        self,
        *,
        name: str,
        dimension: int,
        dtype: VectorDataType = float,
        fields_schema: Optional[FieldSchemaDict] = None,
        metric: str = "cosine",
        extra_params: Optional[Dict[str, Any]] = None,
        vectors: Union[None, VectorParam, Dict[str, VectorParam]] = None,
    ):
        """
        name: str
        """
        self._name = ""
        if not isinstance(name, str):
            raise DashVectorException(
                code=DashVectorCode.InvalidArgument,
                reason=f"DashVectorSDK CreateCollectionRequest name({name}) is invalid and must be str",
            )

        if re.search(COLLECTION_AND_PARTITION_NAME_PATTERN, name) is None:
            raise DashVectorException(
                code=DashVectorCode.InvalidCollectionName,
                reason=f"DashVectorSDK CreateCollectionRequest name characters({name}) is invalid and "
                + COLLECTION_AND_PARTITION_NAME_PATTERN_MSG,
            )
        self._name = name

        """
        vectors
        """
        if vectors is None:
            vectors = {"": VectorParam(dimension=dimension, dtype=dtype, metric=metric)}
        elif isinstance(vectors, VectorParam):
            vectors = {"": vectors}
        elif isinstance(vectors, dict):
            for vector_name in vectors.keys():
                if not isinstance(vector_name, str):
                    raise DashVectorException(
                        code=DashVectorCode.InvalidArgument,
                        reason=f"DashVectorSDK CreateCollectionRequest vector_name type({type(vector_name)}) is invalid and must be str",
                    )
                if re.search(FIELD_NAME_PATTERN, vector_name) is None:
                    raise DashVectorException(
                        code=DashVectorCode.InvalidFieldName,
                        reason=f"DashVectorSDK CreateCollectionRequest vector_name characters({vector_name}) is invalid and "
                               + FIELD_NAME_PATTERN_MSG,
                    )
        if not isinstance(vectors, dict):
            raise DashVectorException(
                code=DashVectorCode.InvalidArgument,
                reason=f"DashVectorSDK CreateCollectionRequest vectors type({type(vectors)}) is invalid and must be dict"
            )
        if len(vectors) > 4:
            raise DashVectorException(
                code=DashVectorCode.InvalidField,
                reason=f"DashVectorSDK CreateCollectionRequest vectors length({len(vectors)}) is invalid and must be in [0, 4]",
            )
        for vector_name, vector_param in vectors.items():
            if not isinstance(vector_param, VectorParam):
                raise DashVectorException(
                    code=DashVectorCode.InvalidArgument,
                    reason=f"DashVectorSDK CreateCollectionRequest vector_param type({type(vector_param)}) is invalid and must be VectorParam",
                )
            vector_param.validate()
        self._vectors = vectors

        """
        fields_schema: Optional[FieldSchemaDict]
        """
        self._fields_schema = {}
        if fields_schema is not None:
            if not isinstance(fields_schema, dict):
                raise DashVectorException(
                    code=DashVectorCode.InvalidArgument,
                    reason=f"DashVectorSDK CreateCollectionRequest fields_schema type({type(fields_schema)}) is invalid and must be dict",
                )

            if len(fields_schema) > 1024:
                raise DashVectorException(
                    code=DashVectorCode.InvalidField,
                    reason=f"DashVectorSDK CreateCollectionRequest fields_schema length({len(fields_schema)}) is invalid and must be in [0, 1024]",
                )

            for field_name, field_dtype in fields_schema.items():
                if not isinstance(field_name, str):
                    raise DashVectorException(
                        code=DashVectorCode.InvalidArgument,
                        reason=f"DashVectorSDK CreateCollectionRequest field_name in fields_schema type({type(field_name)}) is invalid and must be str",
                    )

                if re.search(FIELD_NAME_PATTERN, field_name) is None:
                    raise DashVectorException(
                        code=DashVectorCode.InvalidFieldName,
                        reason=f"DashVectorSDK CreateCollectionRequest field_name in fields_schema characters({field_name}) is invalid and "
                        + FIELD_NAME_PATTERN_MSG,
                    )

                if field_name == DASHVECTOR_VECTOR_NAME:
                    raise DashVectorException(
                        code=DashVectorCode.InvalidFieldName,
                        reason=f"DashVectorSDK CreateCollectionRequest field_name in fields_schema value({DASHVECTOR_VECTOR_NAME}) is reserved",
                    )

                ftype = FieldType.get_field_data_type(field_dtype)
                self._fields_schema[field_name] = ftype

        """
        extra_params: Optional[Dict[str, Any]]
        """
        self._extra_params = {}
        if extra_params is not None:
            if not isinstance(extra_params, dict):
                raise DashVectorException(
                    code=DashVectorCode.InvalidArgument,
                    reason=f"DashVectorSDK CreateCollectionRequest extra_params type({type(extra_params)}) is invalid and must be dict",
                )

            extra_params_is_empty = True
            for extra_param_key, extra_param_value in extra_params.items():
                extra_params_is_empty = False

                if not isinstance(extra_param_key, str) or not isinstance(extra_param_value, str):
                    raise DashVectorException(
                        code=DashVectorCode.InvalidArgument,
                        reason=f"DashVectorSDK CreateCollectionRequest extra_param key/value type is invalid and must be str.",
                    )

                if len(extra_param_key) <= 0:
                    raise DashVectorException(
                        code=DashVectorCode.InvalidExtraParam,
                        reason=f"DashVectorSDK CreateCollectionRequest extra_param key is empty",
                    )

            if not extra_params_is_empty:
                self._extra_params = extra_params

        """
        DashVectorCollectionRequest: google.protobuf.Message
        """
        create_request = dashvector_pb2.CreateCollectionRequest()
        create_request.name = self._name

        # vectors
        for vector_name, vector_param in self._vectors.items():
            vector_pb = create_request.vectors_schema[vector_name]
            vector_pb.metric = MetricType.get(vector_param.metric)
            vector_pb.dimension = vector_param.dimension
            vector_pb.dtype = VectorType.get(vector_param.dtype)
            vector_pb.quantize_type = vector_param.quantize_type

        # fields_schema
        if len(self._fields_schema) > 0:
            for field_name, field_dtype in self._fields_schema.items():
                create_request.fields_schema[field_name] = field_dtype

        # extra_params
        if len(self._extra_params) > 0:
            create_request.extra_params.update(self._extra_params)

        super().__init__(request=create_request)
