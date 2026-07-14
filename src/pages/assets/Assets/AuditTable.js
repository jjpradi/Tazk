import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Dialog, DialogContent, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { ListAuditData, ListAuditDataByCheckListId, getAuditCheckListBasedOnAsset, getSerachAuditAction, setSerachAuditAction } from 'redux/actions/audit_actions';
import CommonSearch from 'utils/commonSearch';
import { headerStyle, cellStyle } from 'utils/pageSize';
import AssetAuditCheckList from 'pages/assets/Audits/AssetAuditCheckList';
import moment from 'moment';
import PropTypes from 'prop-types'

const AuditTable = (props) => {


  const [view,setView] = useState(false)
  const [data,setData]=useState([]);
  const[checkListFields, setCheckListFields] = useState([])
  const[checkList, setCheckList] = useState([])
  const[checkListId, setCheckListId] = useState('')
  const [remarks, setRemarks] = useState('')
  const[auditDate, setAuditDate] = useState('')
  const [auditImages, setAuditImages] = useState([])
    const dispatch = useDispatch()
    // AuditTable.js (add near other useState)
const [checklistName, setChecklistName] = useState('');
const [assetGroup, setAssetGroup] = useState('');
const [assetType, setAssetType] = useState('');
const [imageCount, setImageCount] = useState(0);
const [required, setRequired] = useState(0);


    const [paginateData, setPaginateData] = useState({
        searchString: "",
        pageCount: 0,
        pageSize: 5
    })

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext,
      );

      

      const column_audit=[
        {
          field:'audit_date',
          title:'Audit Request Date',
          render : (rowdata) => {
            return  moment(rowdata.audit_date).format('DD/MM/YYYY')
          }
        },{
          field:'last_audit_date',
          title:'Last Audit Date',
          render: (rowData) => {
            console.log(rowData.last_audit_date, 'rowData.last_audit_date');
            return (rowData.last_audit_date === '' || 
                    rowData.last_audit_date === null || 
                    rowData.last_audit_date === 'null') ? 'not audited' : moment(rowData.last_audit_date).format('DD-MM-YYYY');
          }
        },{
          field:'name',
          title:'Asset Name'
        },
        {
          field : 'action',
          title : 'Action',
          render : (rowData) => {
              return (
                  <Tooltip title = 'View'>
                      <IconButton onClick={()=> handleView(rowData)}><VisibilityIcon/></IconButton>
                      
                  </Tooltip>
              )
          }
      }
      ]

      

    const handleView = async(rowData) =>{
      setView(true)
      setData(rowData)
      let checkListId;
      let checkListFieldsObj = {}
      await dispatch(getAuditCheckListBasedOnAsset(props?.id, {status: rowData.status}, async(response) => {
        const res = await response
        checkListId = res[0]?.checkList_id;
        setCheckListId(checkListId)
        const checkListFields = res[0]?.checkList_fields
        setCheckListFields(checkListFields)
        const first = res?.[0] ?? {};
        setChecklistName(first.checklist_name ?? '');
        setAssetGroup(first.asset_group_id ?? '');
        setAssetType(first.asset_type_id ?? '');
        setImageCount(first.imageCount ?? 0);
        setRequired(first.required ?? 0);
        checkListFields?.map((field) => {
            checkListFieldsObj[field.name] = null
        })

      }))
      setCheckList([checkListFieldsObj])

      if(rowData.status === 'Done'){
        dispatch(ListAuditDataByCheckListId(checkListId, async(response) => {
            const res = await response
            setAuditImages(res.images)
            const checkListData = JSON.parse(res.checkList_values)
            setCheckList([checkListData])
            setAuditDate(res.audit_date)
            setRemarks(res.remarks)
        }))
      }
    }

      const{
        Audits : {
            auditCheckList
        }
      } = useSelector((state) => state)


      const handleClose = ()=>{
        setView(false)
      }

      useEffect(() =>  {
        let payload = {}
        if(props.type !== 'asset_id') {
            payload = {
              searchString : paginateData.searchString,
              pageCount : paginateData.pageCount,
              numPerPage : paginateData.pageSize
          }
        }
        else {
            payload = {
                searchString : paginateData.searchString,
                pageCount : paginateData.pageCount,
                numPerPage : paginateData.pageSize,
                asset_id : props?.id
            }
        }
        dispatch(ListAuditData(payload))
    
      },[paginateData.pageCount,paginateData.pageSize, props?.index])


      const handlePageChange = (page) => {
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
    
          dispatch(setSerachAuditAction({data:[], numRows:0}));
          const payload = {
            searchString : val,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
          const asset_payload = {
            searchString : val,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            asset_id:props?.id
        }
        if(props.type === 'asset_id'){
          dispatch(getSerachAuditAction(
            asset_payload,
            setModalTypeHandler,
            setLoaderStatusHandler
          )
          )
        }
        else{
          dispatch(getSerachAuditAction(
            payload,
            setModalTypeHandler,
            setLoaderStatusHandler
          )
          )

        }
      }

      const cancelSearch = () => {

        setPaginateData({...paginateData,
          searchString: ''})
    
          dispatch(setSerachAuditAction({data:[], numRows:0}));
          const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
          const asset_payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            asset_id:props?.id
        }
        if(props.type === 'asset_id'){
          dispatch(ListAuditData(
            asset_payload,
            setModalTypeHandler,
            setLoaderStatusHandler
          )
          )
        }
        else{
          dispatch(ListAuditData(
            payload,
            setModalTypeHandler,
            setLoaderStatusHandler
          )
          )

        }
      }

    
      
  return (
    <>
         <MaterialTable 
                    // totalCount={auditListCount}
                    style={{margin:'12px'}} 
                    columns={column_audit} 
                    data={auditCheckList.data} 
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
                    onPageChange={(page) => handlePageChange(page)}
                    onRowsPerPageChange={(size) => handlePageSizeChange(size)}
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
                    title='Audit Log' 
            >
          </MaterialTable>


              <div>

              <Dialog open={view === true} >
              <DialogContent  style={{ overflowY: 'auto' }}>
                        <AssetAuditCheckList
                        checkListFields={checkListFields}
                        checkListValues={checkList}
                        checkListId={checkListId}
                        assetId={props?.id}
                        auditImages={auditImages}
                        status={data.status}
                        auditDate={auditDate}
                        remarks={remarks}
                        handleClose={handleClose}
                        auditLog={'audit'}
                        checklistName={checklistName}
                        assetGroup={assetGroup}
                        assetType={assetType}
                        imageCount={imageCount}
                        required={required}
                        />
                        </DialogContent>
              </Dialog>
              </div>
          
    </>
  )
}

AuditTable.propTypes = {
  id : PropTypes.number,
  type : PropTypes.string,
  index : PropTypes.number
}

export default AuditTable
