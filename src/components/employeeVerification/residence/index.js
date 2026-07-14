import React from 'react';
import View from './view';
import NewForm from './form';
import {useSelector} from 'react-redux';

function Residence({
  index,
  data,
  userId,
  edit,
  setEdit,
  handleClose,
  handleDialogOpen,
}) {
  const {
    UserCreationReducer: {empVerificationDetail, verificationType},
  } = useSelector((s) => s);
  return (
    <>
      {edit || !empVerificationDetail.length ? (
        <NewForm
          index={index}
          userId={userId}
          setEdit={setEdit}
          handleClose={handleClose}
          handleDialogOpen={handleDialogOpen}
        />
      ) : (
        <View setEdit={setEdit} />
      )}
    </>
  );
}

export default Residence;
