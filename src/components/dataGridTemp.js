import * as React from 'react';
import { useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Box,
  Card,
  Grid,
  IconButton,
  Typography,
  Stack,
  Button,
  Tooltip,
  Fade,
  Divider,
  Chip,
} from '@mui/material';
import CommonSearch from 'utils/commonSearch';
import PropsTypes from 'prop-types';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { CSVLink } from 'react-csv';
import { headerStyle, cellStyle, Width, maxBodyHeight } from 'utils/pageSize';
import { ExportCsv } from '@material-table/exporters';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReportsBasedOnCategoryAction } from 'redux/actions/userRole_actions';
import SaveIcon from '@mui/icons-material/Save';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { getsessionStorage } from 'pages/common/login/cookies';


export default function DataGridTemp(props) {
  const navigate = useNavigate()
  const {
    title,
    total,
    data,
    columns,
    filter,
    type,
    searchVal,
    requestSearch,
    cancelSearch,
    onPageChange,
    onPageSizeChange,
    rowCount,
    onRowClick,
    isApiFinished,
    posSale,
    handleColumnHide,
    handleColumnSubmit,
    handleExport,
    grandTotal,
    pageSize,
    page,
    attendanceReports,
    columnData,
    rowData,
    exportData,
    handlePreviousMonthClick,
    pageType,
    type2,
    handleOpen,
    scheduleReport,
    shareReport,
    gstrExport,
    gstr,
    filename,
    summaryChip,
    summaryChipData,
    chips,
    handleChipSelect,
    selectedParticularChip,
    summaryDescriptionButton,
    handleTypeChange,
    chipData,
    exportDayBook,
    searchtype,
    report,
    search,
    exportReport,
    showCurrentMonthChip,
    consolidatedChips,
    serviceCreate
  } = props;
  // const [button, setButton] = useState('4');
  // console.log(pageType, type, data, attendanceReports, handleOpen, "pageType")
    const dispatch = useDispatch();
    const companyReportsConfig = useSelector(
      (state) => state.UserRoleReducer?.companyReportsConfig || []
    );

      const storage = getsessionStorage()
  
    useEffect(() => {
      dispatch(getReportsBasedOnCategoryAction());
    }, [dispatch]);
  
    // useEffect(() => {
    //   console.log("companyReportsConfig", companyReportsConfig);
    // }, [companyReportsConfig]);
  
    let salaryReports = companyReportsConfig.find(item => item.Salary)?.Salary || [];
    let hasSalaryStructureReport = salaryReports.some(report => report.name === 'Salary Structure Report');
    
  function ExportCsv(columnData, rowData, fileName) {  
    const columnHeaders = columnData.map(column => column.headerName); // Extract column headers
    const rows = rowData.map(row => columnData.map(column => row[column.field])); // Extract row data

    // Construct CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += columnHeaders.join(",") + "\n"; // Add column headers
    csvContent += rows.map(row => row.join(",")).join("\n"); // Add row data

    // Create a temporary anchor element and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName + ".csv");
    document.body.appendChild(link);
    link.click();
  }

  function ExportCsv1(columnData, rowData, fileName) {
    const columnHeaders = ["Days", ...columnData.filter(column => !["employee_id", "first_name", "last_name", "totalWorkHours", "status", "in_time", "out_time", "late_in_by", "early_out_by", "ot", "shift", "present", "absent", "priority_name", "original_estimation"].includes(column.field)).map(column => column.headerName)]; // Extract column headers

    // Construct CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += columnHeaders.join(",") + "\n"; // Add column headers

    // Add data for each employee
    for (const employee of rowData) {
      csvContent += `Employee: ${employee.employee_id} : ${employee.first_name}${employee.last_name ? ' ' + employee.last_name : ''}      "Total Duration: ${employee.totalWorkHours || 'null'} Total OT: ${employee.ot || '-'} Present: ${employee.present || 0} Absent: ${employee.absent || 0} WeeklyOff: ${employee.weeklyOff || '-'} Holidays: ${employee.holidays || '-'} Leaves Taken: ${employee.leaves}"\n`;


      // csvContent += `Status ${employee.status || '-'}\n InTime ${employee.in_time || '-'}\n  OutTime ${employee.out_time || '-'}\n`;

      // Modify this part to include the correct field for day-wise data
      for (const dayColumn of columnData.filter(column => !["employee_id", "first_name", "last_name", "totalWorkHours", "status", "in_time", "out_time", "late_in_by", "early_out_by", "ot", "shift", "present", "absent"].includes(column.field))) {
        const dayValue = employee[dayColumn.field] || '-';
        const durationValue = dayColumn.field === "Duration" ? `Duration: ${dayValue || '-'}\n` : ''; // Include "Duration" field
        csvContent += `${durationValue}`;
      }

      csvContent += `\n`;
    }

    // Create a temporary anchor element and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName + ".csv");
    document.body.appendChild(link);
    link.click();
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const previousMonths = [];
  const startMonthOffset = showCurrentMonthChip ? 0 : (posSale ? 0 : 1);
  for (let i = startMonthOffset; i < startMonthOffset + 4; i++) {
    const prevMonthIndex = (currentMonthIndex - i + 12) % 12;
    let prevMonthYear = currentYear;
    if (prevMonthIndex > currentMonthIndex) {
      prevMonthYear--;
    }
    const prevMonthString = `${months[prevMonthIndex]} ${prevMonthYear} `;
    previousMonths.push(prevMonthString);
  }
  const PrevMonth = previousMonths[0];
  const firstPrevMonth = previousMonths[1];
  const secondPrevMonth = previousMonths[2];
  const thirdPrevMonth = previousMonths[3];
  

  const handleAdd = () => {
    navigate('/service/jobCard')
  }

  return (
    <Card sx={{ p: '20px', width: '100%', height: pageType === 'purchaseSummary' ? 'calc(100vh - 80px)'  : 'calc(100vh - 80px)', minHeight: '100%',pb:'0px' }}>
      <Grid
        container
        display='flex'
        flexDirection='row'
        pb={ pageType === 'purchaseSummary' ? '0px' : '15px'}
        alignItems='center'
        justifyContent='space-between'
      >
        <Grid
          size={{
            lg: pageType === 'scrapAssetReport' ? 12 : (report === 'dayBook' ? 6 : pageType === 'task' || pageType === 'missinglot' ? 8 : posSale ? 4 : pageType === 'purchaseSummary' ? 5 : pageType === 'salaryColumn' ? 4 : 5),
            md: pageType === 'scrapAssetReport' ? 12 : (report === 'dayBook' ? 4 : pageType === 'task' || pageType === 'missinglot' ? 8 : 4),
            sm: pageType === 'scrapAssetReport' ? 12 : (report === 'dayBook' ? 2.5 : pageType === 'task' || pageType === 'missinglot' ? 8 : 4),
            xs: 12
          }}>
          <Typography component='div'  className='page-title'>
            {title}
          </Typography>
        </Grid>
        
        {title === 'Service' && <>
        <Grid
          display='flex'
          justifyContent='end'
          size={{
            lg: 3,
            md: 3,
            sm: 3,
            xs: 12
          }}>
         <CommonSearch
                searchVal={searchVal}
                cancelSearch={cancelSearch}
                requestSearch={requestSearch}
                style={{ width: '200px' }}
              />
              </Grid>
               <Grid
                 display='flex'
                 justifyContent='end'
                 size={{
                   lg: 0.5,
                   md: 0.5,
                   sm: 0.5,
                   xs: 12
                 }}>
                <IconButton onClick={() => props.setOpenFilter(true)} size="large">
                  <FilterAltIcon />
                </IconButton>
              </Grid>
        <Grid
          size={{
            lg: 0.5,
            md: 0.5,
            sm: 0.5,
            xs: 12
          }}>
        <div onClick={handleOpen} style={{display: 'flex', justifyContent: 'end'}}>
           {
            serviceCreate && <AddIcon style={{ cursor: 'pointer' }} />
           } 
          </div>
          </Grid> </>}
        {(pageType === 'salaryColumn' || pageType === 'scrapAssetReport' || (!hasSalaryStructureReport && pageType !== 'task' && pageType !== 'purchaseSummary' && pageType !== 'missinglot' && pageType !== 'scrapLot')) &&
         <Grid
           gap={1}
           display='flex'
           flexDirection='row'
           justifyContent={pageType === 'scrapAssetReport' ? 'flex-start' : 'flex-end'}
           alignItems='center'
           size={{
             lg: pageType === 'scrapAssetReport' ? 8 : (posSale ? 8 : 4),
             md: pageType === 'scrapAssetReport' ? 8 : (posSale ? 8 : 4),
             sm: pageType === 'scrapAssetReport' ? 12 : (posSale ? 8 : 8),
             xs: 12
           }}>
          <Button
            variant={props.button === '1' ? "contained" : "outlined"}
            color='primary'
            sx={{
              height: { xs: '28px', sm: '30px' },
              padding: { xs: '2px 6px', sm: '4px 8px' },
              minWidth: { xs: '60px', sm: 'auto' },
              fontSize: { xs: '10px', sm: '12px' },
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              borderRadius: 8,
              '& .MuiSvgIcon-root': {
                fontSize: 26,
              },
            }}
            onClick={() => {
              handlePreviousMonthClick(thirdPrevMonth,'1');
              props.setButton('1');
            }}
          >
            {thirdPrevMonth}
          </Button>
          <Button
            variant={props.button === '2' ? "contained" : "outlined"}
            color='primary'
            sx={{
              height: { xs: '28px', sm: '30px' },
              padding: { xs: '2px 6px', sm: '4px 8px' },
              minWidth: { xs: '60px', sm: 'auto' },
              fontSize: { xs: '10px', sm: '12px' },
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              borderRadius: 8,
              '& .MuiSvgIcon-root': {
                fontSize: 26,
              },
            }}
            onClick={() => {
              handlePreviousMonthClick(secondPrevMonth,'2');
              props.setButton('2');
            }}
          >
            {secondPrevMonth}
          </Button>
          <Button
            variant={props.button === '3' ? "contained" : "outlined"}
            color='primary'
            sx={{
              height: { xs: '28px', sm: '30px' },
              padding: { xs: '2px 6px', sm: '4px 8px' },
              minWidth: { xs: '60px', sm: 'auto' },
              fontSize: { xs: '10px', sm: '12px' },
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              borderRadius: 8,
              '& .MuiSvgIcon-root': {
                fontSize: 26,
              },
            }}
            onClick={() => {
              handlePreviousMonthClick(firstPrevMonth,'3');
              props.setButton('3');
            }}
          >
            {firstPrevMonth}
          </Button>
          <Button
            variant={props.button === '4' ? "contained" : "outlined"}
            color='primary'
            sx={{
              height: { xs: '28px', sm: '30px' },
              padding: { xs: '2px 6px', sm: '4px 8px' },
              minWidth: { xs: '60px', sm: 'auto' },
              fontSize: { xs: '10px', sm: '12px' },
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              borderRadius: 8,
              '& .MuiSvgIcon-root': {
                fontSize: 26,
              },
            }}
            onClick={() => {
              handlePreviousMonthClick(PrevMonth,'4');
              props.setButton('4');
            }}
          >
            {PrevMonth}
          </Button>
          {posSale && (
            <>
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                <IconButton onClick={() => handleExport()}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              {filter}
              <CommonSearch
                searchVal={searchVal}
                cancelSearch={cancelSearch}
                requestSearch={requestSearch}
              />
              <Tooltip title='Save Columns' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                <IconButton onClick={handleColumnSubmit}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Grid>
        }

        {
          pageType === 'scrapLot' &&
          <Grid size={{lg: 4, md: 4, sm: 8, xs: 12}}>
            {
              consolidatedChips
            }
          </Grid>
        }

        {hasSalaryStructureReport || pageType === 'salaryColumn' && <Grid
          gap={1}
          display='flex'
          flexDirection='row'
          justifyContent='flex-end'
          size={{
            lg: 4,
            md: 4,
            sm: 8,
            xs: 12
          }}>
          </Grid>
         }

          {type === "latestPayrollReport" && (
          <Grid
            size={{
              lg: pageType === 'scrapAssetReport' ? 4 : (pageType === 'report' ? 12 : pageType === 'purchaseSummary' ? 7 : 3.5),
              md: pageType === 'scrapAssetReport' ? 4 : (pageType === 'report' ? 12 : 4),
              sm: 12,
              xs: 12
            }}>
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
              wrap="nowrap"
          >
              {pageType === 'salaryColumn' &&
                <Grid
                  size={{
                    lg: 2,
                    md: 2,
                    sm: 2,
                    xs: 12
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'end' }}>
                    <Tooltip title='Edit' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                      <IconButton onClick={handleOpen}>
                        <EditIcon style={{ cursor: 'pointer' }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </Grid>
              }
            {pageType === 'scrapAssetReport' ? (
              <>
                {pageType !== 'purchaseSummary' && (
                  <Grid>
                    <CommonSearch
                      searchVal={searchVal}
                      cancelSearch={cancelSearch}
                      requestSearch={requestSearch}
                      style={{ width: '200px' }}
                    />
                  </Grid>
                )}

                {pageType !== 'purchaseSummary' && (
                  <Grid
                    sx={{
                      pl: '4px',
                      pr: '.25px',
                      paddingBottom: '3px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Tooltip
                      title="Filter"
                      TransitionComponent={Fade}
                      TransitionProps={{ timeout: 600 }}
                      placement="top"
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton>{filter}</IconButton>
                      </Box>
                    </Tooltip>
                  </Grid>
                )}

                {exportData !== false && gstr !== true && pageType !== 'purchaseSummary' && pageType !== 'missinglot' && (
                  <Grid>
                    <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                      <IconButton onClick={() => handleExport()}>
                        <FileDownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}

                {(pageType !== 'purchaseSummary' && pageType !== 'deregister' && gstrExport) && (
                  <Grid>
                    {gstrExport}
                  </Grid>
                )}
              </>
            ) : (
              <>
                {exportData !== false && gstr !== true && pageType !== 'purchaseSummary' && pageType !== 'missinglot' && <Grid
                  // sx={{ paddingTop: '10px' }}
                  // size={{
                  //   xl: type2 === 'report' ? ''  : 2,
                  //   lg: type2 === 'report' ? ''  : 3,
                  //   md: type2 === 'report' ? 2 : 1.5,
                  //   sm: type2 === 'report' ? 2 : 1,
                  //   xs: type2 === 'report' ? 2 : 12
                  // }}
                  >
                  <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                    <IconButton onClick={() => handleExport()}>
                      <FileDownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>}
               {  (pageType !== 'purchaseSummary' && pageType !== 'deregister' && gstrExport ) && <Grid
                //  sx={{ paddingTop: '10px' }}
                //  size={{
                //    lg: type2 === 'report' ? '' : type === 'latestPayrollReport' ? 5 : 1.3,
                //    md: type2 === 'report' ? 2 : type === 'latestPayrollReport' ? 5 : 1.5,
                //    sm: type2 === 'report' ? 2 : type === 'latestPayrollReport' ? 5 : 1,
                //    xs: type2 === 'report' ? 2 : type === 'latestPayrollReport' ? 5 : 12
                //  }}
                 >
                    {gstrExport}
                </Grid>}
                { pageType !== 'purchaseSummary' && <Grid
                  sx={{
                    pl: '4px',            
                    pr: '.25px',       
                    paddingBottom: '3px',
                    display: 'flex',
                    justifyContent: 'flex-end', 
                  }}
                  // size={{
                  //   xl: type2 === 'report' ? undefined : 2,
                  //   lg: type2 === 'report' ? undefined : 1.3,
                  //   md: 2,
                  //   sm: type2 === 'report' ? 2 : 1,
                  //   xs: type2 === 'report' ? 2 : 12
                  // }}
                  >
                  <Tooltip
                    title="Filter"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                    placement="top"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton>
                      {filter}
                    </IconButton>
                    </Box>
                  </Tooltip>
                </Grid>}
                
                { 
                pageType !== 'purchaseSummary' && <Grid
                  // size={{
                  //   xl: type2 === 'report' ? 12  : 6,
                  //   lg: type2 === 'report' ? 12  : 7,
                  //   md: type2 === 'report' ? 8 : 8.5,
                  //   sm: type2 === 'report' ? 8 : 6,
                  //   xs: type2 === 'report' ? 8 : 12
                  // }}
                  >
                  <CommonSearch
                    searchVal={searchVal}
                    cancelSearch={cancelSearch}
                    requestSearch={requestSearch}
                    style={{ width: '200px' }}
                  />
                </Grid>
                }
              </>
            )}

            
            
            {
              pageType === 'purchaseSummary' &&
              <Grid
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                size={{
                  lg: 12
                }}>

                  <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                <IconButton onClick={() => handleExport()}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title="Filter"
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement="top"
              >
                <IconButton>
                  {filter}
                </IconButton>
              </Tooltip>

              
                  {chips}
              </Grid>
            }
          </Grid>
          </Grid>
          
        )}
        {type === 'filter' && !posSale && (
          <Grid
            display='flex'
            justifyContent='flex-start'
            alignItems='center'
            size={{
              lg: report === 'dayBook' ? 6 : 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            {
              summaryDescriptionButton && (
                <>
                  <Chip 
                    label="Summary" 
                    color="primary" 
                    variant={chipData === 'summary' ? "filled" : "outlined"}
                    onClick={() => handleTypeChange('summary')} 
                  />
                  <Typography>&nbsp;</Typography>
                  <Typography>&nbsp;</Typography>
                </>
                
              )
            }
            {
              summaryDescriptionButton && (
                <Chip 
                  label="Description" 
                  color="primary" 
                  variant={chipData === 'description' ? "filled" : "outlined"}
                  onClick={() => handleTypeChange('description')} 
                />
              )
            }
            {exportData &&
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                <IconButton onClick={() => ExportCsv(columnData, rowData, filename)}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
            }
            {exportDayBook &&
              <Tooltip title='Export' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                <IconButton onClick={() => handleExport()}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
            }
            {!posSale && (
              <>
                {searchtype === 'closingstock' && <Grid mt={'5px'} minWidth='200px'>
                  <CommonSearch
                    searchVal={searchVal}
                    cancelSearch={cancelSearch}
                    requestSearch={requestSearch}
                    style={{ width: '200px' }}
                  />
                </Grid>}
                <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                  {filter}
                </Tooltip>

                {scheduleReport && (
                  <Tooltip title='Schedule Report' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                    {scheduleReport}
                  </Tooltip>
                )}

                {shareReport && (
                  <Tooltip title='Share' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                    {shareReport}
                  </Tooltip>
                )}

                {exportReport && (
                  <Tooltip title="Export">
                    {exportReport}
                  </Tooltip>
                )}

                {search && (
                  <Tooltip title='Search' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
                    {search}
                  </Tooltip>
                )}
              </>
            )}
            
          </Grid>
        )}

        {posSale === 'posSale' && (
          <Grid
            display='flex'
            justifyContent='flex-end'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography
              variant='h6'
              paddingRight={5}
              align='left'
              color='black'
              mt={1}
            >{`Grand Total : ${grandTotal}`}</Typography>
          </Grid>
        )}

      </Grid>
      {
        (summaryChip && Object.entries(summaryChipData).length > 0) &&
          <Grid container spacing={3} display='flex' alignItems="center">
            {
              Object.entries(summaryChipData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([paymentMode, data], index) => (
                  <React.Fragment key={index}>
                    {paymentMode === "Others" && (
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ alignSelf: "stretch", mx: 3 }}
                      />
                    )}

                    {paymentMode !== "Others" ? (
                      <Grid>
                        <Card sx={{ padding: '5px 40px 5px 5px', minWidth: '100px', backgroundColor: selectedParticularChip === paymentMode ? '#0a8fdc' : '#ffffff' }} onClick={() => handleChipSelect('paymentMode', paymentMode)}>
                          <Typography variant="h6">{paymentMode}</Typography>
                          <Typography variant="h6">
                            {data.reduce((sum, d) => sum + d.total, 0)}
                          </Typography>
                        </Card>
                      </Grid>
                    ) : (
                      <Grid>
                        <Grid container spacing={3}>
                          {data.map((d, i) => (
                            <Grid key={i}>
                              <Card sx={{ padding: '5px 40px 5px 5px', minWidth: '100px', backgroundColor: selectedParticularChip === d.particular ? '#0a8fdc' : '#ffffff' }} onClick={() => handleChipSelect('particular', d.particular)}>
                                <Typography variant="h6">{d.particular}</Typography>
                                <Typography variant="h6">{d.total}</Typography>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    )}
                  </React.Fragment>
                ))
            }
          </Grid>
      }
      {
            pageType === 'purchaseSummary' && <Grid ml={4}>
                <Typography>{`Total : ₹ ${total}`}</Typography>
            </Grid>
            }
      <Box
        sx={{
          width: '100%',
          overflow: 'auto',
          padding: '10px',
          boxSizing: 'border-box',
        }}
      >
        
        <Box
          sx={{
            backgroundColor: '#F4F7FE',
            borderRadius: '4px',
            padding: '8px',
          }}
        >

         { (!isApiFinished && storage.company_type === 5 ) ? (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Loading...
                        </Typography>
                      </Box>
                    )
                  
                  :
         <DataGrid
          style={{ maxHeight : maxBodyHeight, minHeight : summaryDescriptionButton ? 'calc(100vh - 80px)' :  maxBodyHeight }}
          
          
          rows={data}
          columns={columns}
          
          
          rowCount={rowCount}
          onRowClick={attendanceReports !== 'attendanceReports' && onRowClick}
          hideScrollbar={true}
          
          pageSizeOptions={[20, 50, 100]}
          paginationMode='server'
          density='compact'
          disableRowSelectionOnClick
          disableExtendRowFullWidth='true'
          onColumnVisibilityChange={(c) => handleColumnHide(c)}
          showCellVerticalBorder={false}
          showColumnVerticalBorder={false}
           paginationModel={{ page: page, pageSize: pageSize }}
           onPaginationModelChange={(model) => {
             if (model.page !== page) {
               (onPageChange)(model.page);
             }
             if (model.pageSize !== pageSize) {
              (onPageSizeChange)(model.pageSize);
            }
          }}
          // components={{
          //   Toolbar: !posSale && GridToolbar, // !posSale && GridToolbar
          //   NoRowsOverlay: () => (
          //     <Stack
          //       height='100%'
          //       alignItems='center'
          //       justifyContent='center'
          //       mt='25%'
          //     >
          //       {isApiFinished ? 'No rows' : ''}
          //     </Stack>
          //   ),
          // }}
          // sx={{
          //   '& .MuiDataGrid-footerContainer': {
          //     height: '50px',
          //     display: 'flex',
          //     justifyContent:'flex-end',
          //     alignItems: 'center',
          //   },
          //   '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': { width: 10 },
          //   '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
          //     backgroundColor: '#B2B2B2',
          //     borderRadius: 2,
          //     border: '2px solid white',
          //   },
          //   '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
          //     background: '#999',
          //   },
          //   '& .MuiDataGrid-columnHeaders': {
          //       fontFamily: 'Poppins',
          //       fontSize: '12px',
          //       fontWeight: '600',
          //       color: 'rgba(0, 0, 0, 0.7)',
          //     },
          // }}
        />
          
        }
        </Box>
      </Box>
    </Card>
  );
}

DataGridTemp.propTypes = {
  title: PropsTypes.string,
  data: PropsTypes.array,
  columns: PropsTypes.array,
  filter: PropsTypes.element,
  type: PropsTypes.string,
  searchVal: PropsTypes.string,
  requestSearch: PropsTypes.func,
  cancelSearch: PropsTypes.func,
  onPageChange: PropsTypes.string,
  onPageSizeChange: PropsTypes.string,
  rowCount: PropsTypes.number,
  onRowClick: PropsTypes.func,
  isApiFinished: PropsTypes.bool,
  posSale: PropsTypes.string,
  handleColumnHide: PropsTypes.func,
  handleColumnSubmit: PropsTypes.func,
  handleExport: PropsTypes.func,
};
