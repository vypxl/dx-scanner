// https://github.com/jdalrymple/gitbeaker/blob/master/src/core/infrastructure/Utils.ts
/* eslint @typescript-eslint/no-explicit-any: 0 */

import { ClientOptions } from './GitLabClient';
import { AxiosResponse } from 'axios';
import { PaginationParams } from '../../../inspectors';

interface Constructor {
  new (...args: any): any;
}

type Mapper<T extends { [name: string]: Constructor }, P extends keyof T> = {
  [name in P]: InstanceType<T[name]>;
};

export interface Bundle<T extends { [name: string]: Constructor }, P extends keyof T> {
  new (options?: ClientOptions): Mapper<T, P>;
}

export const bundler = <T extends { [name: string]: Constructor }, P extends keyof T>(services: T) => {
  return (function Bundle(this: any, options?: ClientOptions) {
    Object.entries(services || {}).forEach(([name, Ser]) => {
      this[name] = new Ser(options);
    });
  } as any) as Bundle<T, P>;
};

export const parseResponse = <T>(response: AxiosResponse<T>): CustomAxiosResponse<T> => {
  const { headers } = response;
  const { data } = response;
  const pagination = {
    total: parseInt(headers['x-total']),
    next: parseInt(headers['x-next-page']) || null,
    current: parseInt(headers['x-page']) || 1,
    previous: parseInt(headers['x-prev-page']) || null,
    perPage: parseInt(headers['x-per-page']),
    totalPages: parseInt(headers['x-total-pages']),
  };
  return { headers, data, pagination };
};

export interface PaginationGitLabCustomResponse {
  total: number;
  next: number | null;
  current: number;
  previous: number | null;
  perPage: number;
  totalPages: number;
}

export interface CustomAxiosResponse<T> {
  headers: any;
  data: T;
  pagination: PaginationGitLabCustomResponse;
}

export interface ListFilterOptions<Filter = {}> {
  pagination?: PaginationParams;
  filter?: Filter;
}
