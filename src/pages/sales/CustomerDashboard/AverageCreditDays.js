import React from 'react'
import DashboardTile from 'components/DashboardTile'
import useCommonRef from 'pages/common/home/useCommonRef'

const AverageCreditDays = (props) => {
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
            title = 'Average Credit Days'
            // icon = {statusIcon}
            value = {props?.data[0]?.avgCredit_days === null ? 0 : props?.data[0]?.avgCredit_days}
            currencyIcon = {false}
        />
    </div>
  )
}

export default useCommonRef(AverageCreditDays)