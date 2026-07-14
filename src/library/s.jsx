import {useRef, useEffect, useState, useCallback} from 'react';

export const ScrollContainer = ({children, scrollCta}) => {
  const outerDiv = useRef(null);
  const innerDiv = useRef(null);

  const prevInnerDivHeight = useRef(null);

  const [showMessages, setShowMessages] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const outerDivHeight = outerDiv.current.clientHeight;
    const innerDivHeight = innerDiv.current.clientHeight;
    const outerDivScrollTop = outerDiv.current.scrollTop;


    if (
      !prevInnerDivHeight.current ||
      prevInnerDivHeight.current - (outerDivScrollTop + outerDivHeight) > -100
    ) {
      outerDiv.current.scrollTo({
        top: innerDivHeight - outerDivHeight,
        left: 0,
        behavior: prevInnerDivHeight.current ? 'smooth' : 'auto',
      });
      setShowMessages(true);
    } else {
      setShowScrollButton(true);
    }

    prevInnerDivHeight.current = innerDivHeight;
  }, [children]);

  const handleScrollButtonClick = useCallback(() => {
    const outerDivHeight = outerDiv.current.clientHeight;
    const innerDivHeight = innerDiv.current.clientHeight;

    outerDiv.current.scrollTo({
      top: innerDivHeight - outerDivHeight,
      left: 0,
      behavior: 'smooth',
    });

    setShowScrollButton(false);
  }, []);


  return (
    <div
      style={{position: 'relative', height: '100%'}}
      // className="relative h-full"
    >
      <div
        style={{overflow: 'scroll', position: 'relative', height: '100%'}}
        // className="relative h-full overflow-scroll"
        ref={outerDiv}
      >
        <div
          style={{
            opacity: showMessages ? 1 : 0,
            position: 'relative',
            transitionProperty: 'all',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDuration: ['300ms', '300ms'],
          }}
          // className="relative transition-all duration-300"
          // style={{ opacity: showMessages ? 1 : 0 }}
          ref={innerDiv}
        >
          {children}
        </div>
      </div>
      <button
        style={{
          transform: 'translateX(-50%)',
          opacity: showScrollButton ? 1 : 0,
          pointerEvents: showScrollButton ? 'auto' : 'none',
          position: 'absolute',
          bottom: '0.25rem',
          left: '50%',
          borderRadius: '0.5rem',
          width: '7rem',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          color: '#ffffff',
          backgroundColor: '#EF4444',
          transitionProperty: 'all',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: ['300ms', '300ms'],
        }}
        // className="absolute bg-red-500 text-white bottom-1 left-1/2 w-28 rounded-lg text-sm transition-all duration-300"
        onClick={handleScrollButtonClick}
      >
        {scrollCta}
      </button>
    </div>
  );
};
