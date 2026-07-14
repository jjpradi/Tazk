export const getSinglePageScrollLayoutSx = (topOffset = 160) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: `calc(100dvh - ${topOffset}px)`,
  maxHeight: `calc(100dvh - ${topOffset}px)`,
  minHeight: 0,
  overflow: 'hidden',
});

export const singlePageScrollContentSx = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
};

export const singlePageScrollHostSx = {
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
};
