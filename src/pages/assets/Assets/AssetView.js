import React from 'react'
import Assets from '.';
import PropTypes from 'prop-types';

const AssetView = (props) => {
    const {onviewAsssetDetail}=props;
  return (
    <div>
        <Assets  onviewAsssetDetail={onviewAsssetDetail}/>
    </div>
  )
}

export default AssetView

AssetView.proptypes={
    onviewAsssetDetail:PropTypes.func,
}