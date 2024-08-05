import { httpRequest } from '@/libs/request';
import { IMessage } from '@/types/serivce';

export const stopGeneration = (data: IMessage) => {
  return httpRequest({ url: '/v1/stopGeneration', data });
};

export const getUploadFileToken = (data: { fileName: string; userId: string }) => {
  return httpRequest({
    url: '/v1/getUploadPolicy',
    data,
    method: 'POST',
  });
}

export const getDataId = (data: { fileName: string; ossPath: string, userId: string }) => {
  return httpRequest({
    url: '/v1/importDocument',
    timeout: 60 * 1000,
    data,
    method: 'POST',
  })
}
