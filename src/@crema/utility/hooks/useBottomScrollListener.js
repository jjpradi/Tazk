import { useEffect } from 'react';
import lodashDebounce from 'lodash.debounce';

const createCallback = (debounce, handleOnScroll, options) => {
  if (debounce) {
    return lodashDebounce(handleOnScroll, debounce, options);
  }

  return handleOnScroll;
};

const useBottomScrollListener = (onBottom, options) => {
  const { offset = 0, triggerOnNoScroll = false, debounce = 200, debounceOptions = { leading: true } } = options || {};

  const debouncedOnBottom = createCallback(debounce, onBottom, debounceOptions);
  const containerRef = { current: null };

  const handleOnScroll = () => {
    if (containerRef.current != null) {
      const scrollNode = containerRef.current;
      const scrollContainerBottomPosition = Math.round(scrollNode.scrollTop + scrollNode.clientHeight);
      const scrollPosition = Math.round(scrollNode.scrollHeight - offset);

      if (scrollPosition <= scrollContainerBottomPosition) {
        debouncedOnBottom();
      }
    } else {
      const scrollNode = document.scrollingElement || document.documentElement;
      const scrollContainerBottomPosition = Math.round(scrollNode.scrollTop + window.innerHeight);
      const scrollPosition = Math.round(scrollNode.scrollHeight - offset);

      if (scrollPosition <= scrollContainerBottomPosition) {
        debouncedOnBottom();
      }
    }
  };

  useEffect(() => {
    const ref = containerRef.current;
    if (ref != null) {
      ref.addEventListener('scroll', handleOnScroll);
    } else {
      window.addEventListener('scroll', handleOnScroll);
    }

    if (triggerOnNoScroll) {
      handleOnScroll();
    }

    return () => {
      if (ref != null) {
        ref.removeEventListener('scroll', handleOnScroll);
      } else {
        window.removeEventListener('scroll', handleOnScroll);
      }
    };
  }, [handleOnScroll, triggerOnNoScroll]);

  return containerRef;
};

export default useBottomScrollListener;
