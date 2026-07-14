import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAssignToDataAction, getSearchAssignToAction, setSearchAssignListAction, setSearchAssignToAction } from 'redux/actions/asset_actions'
import CommonSearch from 'utils/commonSearch'
import { headerStyle, cellStyle } from 'utils/pageSize'

const AssignToTable = (props) => {

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext,
      );
     
      const dispatch = useDispatch()
      
      const{
        AssetReducers:{
            assetsAssignedToCount,
            assetsAssignedTo
        }
      } = useSelector((state) => state)

      const[paginateData, setPaginateData] = useState({
        searchString: "",
        pageCount: 0,
        pageSize: 5
    })

    useEffect(()=>{
          if(props?.code && props?.filteredData?.Code && props.code === props.filteredData.Code){
            const payload ={
              code: props.code,
              searchString: paginateData.searchString,
              pageCount: paginateData.pageCount,
              numPerPage: paginateData.pageSize
          }
  
          dispatch(getAssignToDataAction(payload))
          }
        
      },[paginateData.pageCount,paginateData.pageSize, props?.index])

      

    const Assert_data =  assetsAssignedTo
    .filter(a => props?.filteredData?.Code && props.filteredData.Code == a.asset_code)
    .map(a => ({
      assign_to: a.last_name ? ` ${a.first_name} ${a.last_name}`  : a.first_name,
      createdAt: a.createdAt,
      location:props?.filteredData?.Location, 
      condition: a.condition 
    }));

    console.log(Assert_data,'assignnnnnnnn',assetsAssignedTo,props.filteredData)


    const column_assert=[
        {
          field:'assign_to',
          title:'Assigned to'
        },{
          field:'createdAt',
          title:'Assigned Date',
          render : (rowData) => {
            return moment(rowData.createdAt).format('DD/MM/YYYY')
          }
        },{
          field:'location',
          title:'Location'
        },{
          field:'condition',
          title:'Condition'
        }
      ]

 const handlePageChange = (page) =>{
    setPaginateData({...paginateData,
      pageCount: page})
  }
  
  const handlePageSizeChange = (size) => {
    setPaginateData({...paginateData,
      pageSize: size})
  }

    const requestSearch = (e) => {
        const val = e.target.value
     
        setPaginateData({...paginateData,
          searchString: val})
     
          dispatch(setSearchAssignToAction({data:[], numRows:0}));
          const payload = {
            code: props.code,
            searchString : val,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(getSearchAssignToAction(
          payload,
          setModalTypeHandler,
          setLoaderStatusHandler
        )
        )
      }
      useEffect(()=>{
        setPaginateData({...paginateData,
          searchString: ''})
      },[props.code])
   const cancelSearch = () => {
 
    setPaginateData({...paginateData,
      searchString: ''})
 
      dispatch(setSearchAssignListAction({data:[], numRows:0}));
      const payload = {
        code: props.code,
        searchString : '',
        pageCount : paginateData.pageCount,
        numPerPage : paginateData.pageSize
    }
    dispatch(getSearchAssignToAction(
      payload,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
    )
  }
  return (
    <div>
        <MaterialTable
                            style={{margin:'12px'}}
                            columns={column_assert}
                            data={Assert_data}
                          totalCount={assetsAssignedToCount}
                            title='Asset Details'
                            options={{
                              headerStyle,
                              cellStyle,
                              filtering: false,
                              actionsColumnIndex: -1,
                              paging: true,
                              pageSize: paginateData.pageSize,
                              pageSizeOptions: [5, 10, 20],
                              search: false,
                            }}

                            page={paginateData.pageCount}
                            onPageChange={(page)=> handlePageChange(page)}
                            onRowsPerPageChange={(size)=> handlePageSizeChange(size)}

                           
                            components={{
                              Toolbar: (props) => (
                                <div>
                                  <div
                                      style={{
                                        display: 'flex',
                                        width: '100%',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <div style={{width: '100%'}}>
                                        <MTableToolbar {...props} />
                                      </div>
                                    <div>
                                      <CommonSearch
                                        searchVal={paginateData.searchString}
                                        cancelSearch={cancelSearch}
                                        requestSearch={requestSearch}
                                      />
                                      </div>
                                    </div>
               
                                </div>
                              ),
                            }}
                          
                          >

                          
                          </MaterialTable>
    </div>
  )
}

export default AssignToTable
