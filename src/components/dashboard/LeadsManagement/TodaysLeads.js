import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import { titleURL } from "http-common"
import { useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useDispatch, useSelector } from "react-redux"
import { getLeadsAction, getTodaysLeadsAction } from "redux/actions/leadManagement_actions"
import { headerStyle, cellStyle, maxBodyHeight } from "utils/pageSize"
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Card, Typography } from "@mui/material"
import { ExportCsv, ExportPdf } from "@material-table/exporters"

function TodaysLeads(props){

    const dispatch = useDispatch()
    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)
    const {
        leadManagementReducers: {getLeads,getTodaysLeads}
    } = useSelector(state => state)
    
    const[pagination, setPagination] = useState({
        pageCount: 0,
        numPerPage: 5,
        searchString: ''
    })
    const[open, setOpen] = useState(true)
    const[rowData, setRowData] = useState([])

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         dispatch(getTodaysLeadsAction(setModalTypeHandler, setLoaderStatusHandler));
                
    //     }, 1000);
    
    //     return () => clearTimeout(timer); 
    // }, [open, props?.data]);

    const columns = [
        {
            field: 'Lead Owner',
            title: 'Lead Owner'
        },
        {
            field: 'Lead Name',
            title: 'Lead Name'
        },
        {
            field: 'Lead Description',
            title: 'Lead Description',
            render : (rowData) => {
                return rowData['Lead Description'] === null ? '-' : rowData['Lead Description']
            }
        },
        {
            field: 'Lead Source',
            title: 'Lead Source'
        },
        {
            field: 'Lead Status',
            title: 'Lead Stage',
            render: (rowData) => rowData?.['Lead Stage'] || rowData?.['Lead Status'] || '-'
        },
    
    ]

    useEffect(() => {
        if(props?.mode === 'edit'){
            setOpen(false)
        }
        else{
            setOpen(true)
        }
      },[props?.mode])

      console.log(props.data[0],'getTodaysLeads')

    return(
        <>

        <style>
            {`
                ::-webkit-scrollbar-button {
                    display : none
                }
                ::-webkit-scrollbar {
                    width : 10px
                }
                ::-webkit-scrollbar-thumb {
                    background-color : #888
                    border-radius : 10px
                }
                ::-webkit-scrollbar-thumb:hover {
                    background-color : #555
                }
            `}
      </style>

        <Helmet>
            <meta charSet="utf-8" />
            <title>{titleURL} | Leads</title>
        </Helmet>

            <MaterialTable
                // style={{height: '100%'}}
                columns={columns}
                data={props?.data?.[0]?.todayLeads ?? []}
                options={{
                    filtering: false,
                    actionsColumnIndex: -1,
                    paging: false,
                    search: false,
                    maxBodyHeight: '325px',
                    minBodyHeight : '325px',
                    headerStyle: headerStyle,
                    cellStyle: cellStyle,
                    exportButton : true,
                    exportMenu : [
                        {
                            label : 'Export CSV',
                            exportFunc : (cols, datas) => 
                                ExportCsv(cols, datas, 'Todays Leads')
                        },
                        {
                            label : 'Export PDF',
                            exportFunc : (cols, datas) => 
                                ExportPdf(cols, datas, 'Todays Leads')
                        }
                    ]
                }}
                title={
                    <Typography 
                        variant = 'h6'
                        style = {{
                            padding : '5px',
                            paddingBottom : props.mode === 'edit' ? '23px' : '20px'
                        }}
                    >
                        {"Today's Leads"}
                    </Typography>
                }

                actions={[
                    {
                        icon:()=>props?.isEnabled ? <VisibilityOffIcon/> : <VisibilityIcon />,
                        isFreeAction:true,
                        hidden:open,
                        onClick:()=>props?.setCardClose()
                    }
                ]}
            >
            </MaterialTable>
        </>
    )

}

export default TodaysLeads ;

