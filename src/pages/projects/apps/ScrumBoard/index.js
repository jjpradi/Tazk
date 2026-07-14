import React from 'react';
import BoardDetail from './BoardDetail';
import BoardList from './BoardList';
import {useParams, useSearchParams} from 'react-router-dom';

const ScrumBoard = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");

  const onGetMainComponent = () => {
    
    if (id) {
      return <BoardDetail key={id} id={id}/>;
    } else {
      return <BoardList />;
    }
  };

  return <>{onGetMainComponent()}</>;
};

export default ScrumBoard;
