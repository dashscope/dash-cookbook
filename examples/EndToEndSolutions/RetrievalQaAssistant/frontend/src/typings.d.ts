/// <reference types="@ice/app/types" />

declare module '*.less';
declare module 'remark-gfm';

interface IGuide {
  contentData: string;
  iconUrl: string;
  showData: string;
  title: string;
}

interface Window {
  stageName?: string;
  realName?: string;
  empId?: string;
  csrfToken: string;
  env?: string;
  errorCode?: string;
  statusCode?: string;
  isShowBroadscopePortal?: string;
  [k as string]: any;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
declare interface ICategory {
  name: string;
  code: string;
  icon: string;
}

declare interface IAppData {
  category: string;
  categoryName: string;
  order: number;
  appList: IApp[];
}

declare interface IApp {
  appDesc: any;
  name: string;
  category: string;
  desc: string;
  enable: boolean;
  templateCode: string;
  icon: string;
  detailDesc: string;
  placeHolder: string;
  detailDescs?: string[];
}

interface Window {
  [k: string]: any;
}
interface Location {
  hrefTo: (route: string) => void;
}
