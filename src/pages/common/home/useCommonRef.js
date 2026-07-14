import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import useIntersection from 'utils/useIntersection'
const useCommonRef = (Comp) => {

    const Func = (props) => {
        const [status, setStatus] = useState(true);
        const {ref, inView} = useInView({
            threshold: 0,
            triggerOnce: true,
            // skip: status,
        });

        const isVisibleRef = useRef(null);
        const inViewport = useIntersection(isVisibleRef, '0px'); 

       
        function pollServer(...actions) {
          const promiseResult = Promise.allSettled(actions.map((item) => item))
            .then((result) => {
            })
            .catch((error) => {
            });
            return promiseResult
        }

        const DASHBOARD_API_POLL_TIMING = 15 * 60000 // 15 min

        return <Comp 
          ref1={ref} 
          inView={inView} 
          {...props} 
          VisibilityIcon={VisibilityIcon} 
          VisibilityOffIcon={VisibilityOffIcon} 
          pollServer={pollServer} 
          isVisibleRef={isVisibleRef} 
          inViewport={inViewport}
          DASHBOARD_API_POLL_TIMING={DASHBOARD_API_POLL_TIMING}
        />
    } 
    return Func
} 
export default useCommonRef;