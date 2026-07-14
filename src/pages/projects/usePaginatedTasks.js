import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { filterTaskDetailsAction } from 'redux/actions/payrollDashboard_actions';

const PAGE_SIZE = 50;
const MAX_PAGES = 400; // hard cap — 400 * 50 = 20k rows

export default function usePaginatedTasks({ search, projectname, duedate, employee, typeFilter, refreshKey = 0 }) {
  const dispatch = useDispatch();

  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [appending, setAppending] = useState(false);

  // Refs read by the IntersectionObserver callback. Using refs (not state)
  // means the observer is set up once per sentinel mount and always reads
  // fresh values — recreating the observer on every state change caused it
  // to re-fire its initial intersection check and produce an apparent
  // fetch loop after each search.
  const inFlightRef = useRef(false);
  const pageCountRef = useRef(0);
  const totalCountRef = useRef(0);
  const tasksLenRef = useRef(0);
  const lastRequestedPageRef = useRef(-1);
  const filterPayloadRef = useRef(null);
  const observerRef = useRef(null);

  // Stable JSON key — recreating `employee` array reference with same
  // contents won't trigger a refetch.
  const filterKey = JSON.stringify({
    search: search ?? '',
    projectname: projectname ?? null,
    duedate: duedate ? moment(duedate).format('YYYY-MM-DD') : null,
    employee: employee?.length ? employee : null,
    typeFilter,
    refreshKey,
  });

  // Keep latest filter snapshot in a ref so fetchPage stays referentially stable.
  filterPayloadRef.current = (page) => ({
    searchString: search ?? '',
    numPerPage: PAGE_SIZE,
    pageCount: page,
    employeeFilter: employee?.length ? employee : null,
    dueDateFilter: duedate ? moment(duedate).format('YYYY-MM-DD') : null,
    projectFilter: projectname ?? null,
    typeFilter,
  });

  const fetchPage = useCallback((page, append) => {
    if (inFlightRef.current) return;
    if (page > MAX_PAGES) return;
    inFlightRef.current = true;
    lastRequestedPageRef.current = page;
    if (append) setAppending(true);
    else setLoading(true);

    dispatch(filterTaskDetailsAction(filterPayloadRef.current(page), (res) => {
      const rows = Array.isArray(res?.data) ? res.data : [];
      const total = Number(res?.numRows || 0);
      const prevLen = tasksLenRef.current;
      const nextLen = append ? prevLen + rows.length : rows.length;
      // If a paginated append returned no rows even though totalCount
      // claimed more remained, treat the list as exhausted — protects
      // against count/paged divergence in the SQL.
      const effectiveTotal = (append && rows.length === 0) ? nextLen : total;
      tasksLenRef.current = nextLen;
      totalCountRef.current = effectiveTotal;
      setTotalCount(effectiveTotal);
      setTasks((prev) => (append ? [...prev, ...rows] : rows));
      pageCountRef.current = page;
      if (append) setAppending(false);
      else setLoading(false);
      // Release inFlight on the next tick so React commits the state update
      // (which pushes the sentinel down) before the observer can re-evaluate.
      setTimeout(() => { inFlightRef.current = false; }, 0);
    }));
  }, [dispatch]);

  // Reset & refetch when the logical filter changes.
  useEffect(() => {
    pageCountRef.current = 0;
    totalCountRef.current = 0;
    tasksLenRef.current = 0;
    lastRequestedPageRef.current = -1;
    inFlightRef.current = false;
    setTasks([]);
    setTotalCount(0);
    fetchPage(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // Callback ref: sets up the IntersectionObserver when the sentinel node
  // mounts and disconnects when it unmounts. Replaces the standard `useRef`
  // + effect pattern, which would miss the case where the sentinel is
  // conditionally rendered after the effect has already run.
  const sentinelRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (inFlightRef.current) return;
        if (tasksLenRef.current >= totalCountRef.current) return;
        const nextPage = pageCountRef.current + 1;
        if (nextPage <= lastRequestedPageRef.current) return;
        fetchPage(nextPage, true);
      },
      { rootMargin: '300px' },
    );
    observerRef.current.observe(node);
  }, [fetchPage]);

  // Disconnect on unmount.
  useEffect(() => () => {
    if (observerRef.current) observerRef.current.disconnect();
  }, []);

  const hasMore = tasks.length < totalCount;

  const refetch = useCallback(() => {
    pageCountRef.current = 0;
    totalCountRef.current = 0;
    tasksLenRef.current = 0;
    lastRequestedPageRef.current = -1;
    inFlightRef.current = false;
    fetchPage(0, false);
  }, [fetchPage]);

  return {
    tasks,
    setTasks,
    totalCount,
    loading,
    appending,
    hasMore,
    sentinelRef,
    refetch,
  };
}
