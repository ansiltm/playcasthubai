import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { beginRequest } from './requestActivity';

export function trackRequests(client: AxiosInstance) {
  const completions = new WeakMap<InternalAxiosRequestConfig, () => void>();
  const finish = (config?: InternalAxiosRequestConfig) => {
    if (!config) return;
    completions.get(config)?.();
    completions.delete(config);
  };
  client.interceptors.request.use(config => {
    completions.set(config, beginRequest());
    return config;
  });
  client.interceptors.response.use(response => {
    finish(response.config);
    return response;
  }, error => {
    finish(error.config);
    return Promise.reject(error);
  });
  return client;
}
