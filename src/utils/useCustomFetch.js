import React, {useState, useEffect} from 'react';
import http from '../http-common';

export const useCustomFetch = () => {
  function makeQuery(url, http_method, payload = {}, config = {}) {
    switch (http_method) {
      case 'POST':
        return http.post(url, payload, config);
      case 'PUT':
        return http.put(url, payload, config);
      case 'GET':
        return http.get(url, config);
      case 'DELETE':
        return http.delete(url, config);
      default:
        return null;
    }
  }
 
  return async (url, http_method, payload = {}, config = {}, callback = () => {}) => {
    let data = null;
    let loading = true;
    let error = null;
 
    try {
      const res = await makeQuery(url, http_method, payload, config);
      data = res.data;
      loading = false;
      callback(res.data);
      return { data, loading, error };
    } catch (err) {
      error = err;
      loading = false;
      return { data, loading, error };
    }
  };
};

