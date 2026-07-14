import React from 'react';
// import Typography from '@mui/material/Typography';
// import Chip from '@mui/material/Chip';
// import CheckIcon from '@mui/icons-material/Check';
// import CloseIcon from '@mui/icons-material/Close';
import SummaryTabs from './SummaryTabs';

const Summary = ({
  isnet,
  Tdata,
  PSData,
  posId,
  s_id,
  checkOfflines,
  lastSyncUpdate,
  pos_session,
  active,
}) => {
  return (
    <>
      <SummaryTabs
        pos_session={pos_session}
        checkOfflines={checkOfflines}
        lastSyncUpdate={lastSyncUpdate}
        s_id={s_id}
        isnet={isnet}
        Tdata={Tdata}
        PSData={PSData}
        posId={posId}
        active={active}
      />
    </>
  );
};

export default Summary;
