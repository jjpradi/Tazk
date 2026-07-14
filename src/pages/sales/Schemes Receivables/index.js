import MaterialTable, { MTablePagination, MTableToolbar } from 'utils/SafeMaterialTable';
import React, { useState,useContext, useEffect } from 'react';
import { useCustomFetch } from 'utils/useCustomFetch';
import context from '../../../context/CreateNewButtonContext'
import { maxBodyHeight } from 'utils/pageSize';
import { TablePagination } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import CommonSearch from 'utils/commonSearch';
import { getSchemesReceivablesAction, schemesReceivablesAction, setSchemesReceivablesAction } from 'redux/actions/schemes_actions';
import { useDispatch, useSelector } from 'react-redux';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';

function SchemesReceivables() {
  const [data, setData] = useState([]);

    const [paginateData, setPaginateData] = useState({
      searchString: '',
      pageCount: 0,
      pageSizes: 20,
      page: 0,
    });

    const { headerupdate, currentPage, page, pageSizes, searchVal, searchPageData, searchData
  } = paginateData
  const dispatch = useDispatch()

    const {
      schemesReducer: {getSchemesReceivables,countSchemesReceivables},
    } = useSelector((state) => state);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  useEffect(() => {
    const payload = {
      searchString: paginateData.searchString,
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSizes,
    };
    dispatch(schemesReceivablesAction(payload));
  }, [paginateData.pageCount, paginateData.pageSizes]);

    const requestSearch = (e) => {
      const val = e.target.value;
  
      setPaginateData({...paginateData, searchString: val});
  
      dispatch(
        getSchemesReceivablesAction({
          data: [],
          numRows: 0,
        }),
      );
  
      const payload = {
        searchString: val,
        pageCount: 0,
        numPerPage: paginateData.pageSizes,
      };
      dispatch(
        setSchemesReceivablesAction(
          payload,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    };

      const cancelSearch = () => {
        setPaginateData({...paginateData, searchString: ''});
    
        dispatch(
          getSchemesReceivablesAction({
            data: [],
            numRows: 0,
          }),
        );
    
        const payload = {
          searchString: '',
          pageCount: paginateData.pageCount,
          numPerPage: paginateData.pageSizes,
        };
        dispatch(
          schemesReceivablesAction(payload, setModalTypeHandler, setLoaderStatusHandler),
        );
      };
       const handlePageChange = async (page) => {
        setPaginateData({ ...paginateData, page: page });}

        const handlePageSizeChange = async (size) => { setPaginateData({ ...paginateData, pageSizes: size });}

  return (
    <div style={{ height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Helmet>
          <meta charSet="utf-8" />
          <title> {titleURL} | Schemes Receivables </title>
        </Helmet>
        <MaterialTable
          style={{ flexGrow: 1,  boxShadow: 'none', }}
          title="Schemes Receivables"
           totalCount={countSchemesReceivables}
          columns={[
            { title: 'Scheme ID', field: 'scheme_id' },
            { title: 'Status', field: 'status', type: 'string' },
            { title: 'Product ID', field: 'product_id' },
          ]}    
          data={getSchemesReceivables || []}
          options={getStickyTableOptions({
            bodyOffset: 200,
            options:{
               paging: true,
            paginationPosition: 'bottom',
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            // tableLayout: 'fixed',
            search :false,
            toolbar: true,
            tableLayout: "auto",
            // toolbar: true,
            maxBodyHeight: maxBodyHeight,
            minBodyHeight: maxBodyHeight,
            overflowY: 'auto',
            },
          }) }
           components={{
            ...stickyTableComponents,
              Pagination: (props) => (
                                                <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent: "flex-end",
                                                  alignItems: "center",
                                                   padding: "8px 16px",
                                                   }}>
                                                    <TablePagination
                                                    {...props}
                                                    count={countSchemesReceivables} 
                                                    page={page}
                                                    onPageChange={(event, page) => handlePageChange(page)}
                                                    onRowsPerPageChange={(event) => handlePageSizeChange(Number(event.target.value))}/>
                                                    </div>),
                        Toolbar: (props) => (
                          <>
                            
                            <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                              <div style={{ width: '100%' }} >
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
                          </>
                        ),
                      }}
            page={page}
             onPageChange={(page) => handlePageChange(page)}
            onRowsPerPageChange={(size) => handlePageSizeChange(size)}
        />
      </div>
    </div>
  );
}

export default SchemesReceivables;

