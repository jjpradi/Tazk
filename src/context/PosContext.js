import React from 'react';

export default React.createContext({
  activePosLocationId: null,
  setActivePosLocationIdHandler: () => {},
  activePosSessionId: null,
  setActivePosSessionIdHandler: () => {},
});
