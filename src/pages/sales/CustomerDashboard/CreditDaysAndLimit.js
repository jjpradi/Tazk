import React from 'react'
import DashboardTile from 'components/DashboardTile'
import useCommonRef from 'pages/common/home/useCommonRef'

const CreditDaysAndLimit = (props) => {
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
            title = 'CreditDays / CreditLimit'
            // icon = {statusIcon}
            value = {`${props?.data[0]?.credit_days || 0} / ${props?.data[0]?.credit_value || 0}`}
            currencyIcon = {false}
        />
    </div>
  )
}

export default useCommonRef(CreditDaysAndLimit)