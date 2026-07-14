import { ListLoad, FailLoad } from "redux/actions/load";


const apiCalls = (setModalTypeHandler, setLoaderStatusHandler, ...actions) => {

  // Starting the Loader
  ListLoad(setModalTypeHandler, setLoaderStatusHandler);
  
  const promiseResult = Promise.allSettled(actions.map((item) => item))
    .then((result) => {
      // Stopping the loader after all api resolved
      console.log('tyen');
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return result
    })
    .catch((error) => {
      // Stopping the loader after all api resolved
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    });

 return promiseResult
};

export default apiCalls;
