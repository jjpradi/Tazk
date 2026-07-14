import React from 'react'
import DashboardTile from 'components/DashboardTile'
import useCommonRef from 'pages/common/home/useCommonRef'

const TotalBills = (props) => {
  return (
    <div
        ref = {(el) => {
            props.ref1(el)
            props.isVisibleRef.current = el
        }}
        style = {{ width : '100%' }}
    >
        <DashboardTile 
            {...props}
            title = 'Total Bills'
            // icon = {statusIcon}
            value = {props?.data[0]?.total_bills || 0}
            currencyIcon = {false}
        />
    </div>
  )
}

export default useCommonRef(TotalBills)