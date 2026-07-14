import {useCallback, useEffect, useState} from 'react';
// import http from '';
import axios from 'axios';
import {ListLoad, FailLoad} from 'redux/actions/load';

export default function useInfiniteScroll(query, pageNumber) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setData([]);
  }, [query]);

  useEffect(() => {
    // setLoading(true);
    // setError(false);
    const getData = setTimeout(() => {

    }, 2000);

    return () => clearTimeout(getData);
  }, [query, pageNumber]);


  return {loading, error, data, hasMore};
}

// export function* handleProductInfiniteScroll(action) {
//   const CancelToken = axios.CancelToken;
//   const source = CancelToken.source();
//   try {
//     const val = action.body.searchString
//     if(val.trim() !== ''){

//       ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
//       const response = yield call(http.post, '/product/infiniteScrollSearch',
//       {...action.body},
//       { cancelToken: source.token,}
//       );
//       const {data} = response;
//       yield put(set_productInfiniteScroll(data));
//       FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
//     }
//   } catch (error) {
//     FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
//   } finally {
//     if (yield cancelled()) {
//       source.cancel();
//     }
//   }
// }
