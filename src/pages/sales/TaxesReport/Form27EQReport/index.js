import { Link, Typography } from "@mui/material";
import DataGridTemp from "components/dataGridTemp";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getForm27EQReportAction, getSearchForm27EQReportAction, setSearchForm27EQReportAction } from "redux/actions/tax_actions";
import context from '../../../../context/CreateNewButtonContext';
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';

function Form27EQReport(){

  const dispatch = useDispatch()
  const {
    taxReducer: { form27EQReport:  { data, numRows } }
  } = useSelector(state => state)

 const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const [pagination, setPagination] = useState({
    pageCount: 0,
    numPerPage: 20,
    searchString: ""
  })

  useEffect(() => {
    dispatch(getForm27EQReportAction(pagination, setModalTypeHandler, setLoaderStatusHandler))
  }, [pagination.pageCount, pagination.numPerPage])

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, pageCount: page }))
  }

  const handlePageSizeChange = (size) => {
    setPagination((prev) => ({ ...prev, numPerPage: size }))
  }

  const requestSearch = (event) => {
    const val = event.target.value
    setPagination((prev) => ({ ...prev, searchString: val }))

    dispatch(setSearchForm27EQReportAction({ data: [], numRows: 0 }))
    const payload = {
      pageCount: 0,
      numPerPage: pagination.numPerPage,
      searchString: val
    }
    dispatch(getSearchForm27EQReportAction(payload))
  }

  const cancelSearch = (event) => {
    setPagination((prev) => ({ ...prev, searchString: '' }))
    
    dispatch(setSearchForm27EQReportAction({ data: [], numRows: 0 }))
    const payload = {
      pageCount: 0,
      numPerPage: pagination.numPerPage,
      searchString: ''
    }
    dispatch(getSearchForm27EQReportAction(payload))
  }

  const columns = []

  return(
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | Form No 27EQ </title>
      </Helmet>
      <DataGridTemp
        pageSize = {pagination.numPerPage}
        page = {pagination.pageCount}
        pageType = 'task'
        title = {
          <Typography variant = 'h6' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            <Link href = '/report' underline = 'hover'>Home</Link>
            {' / Form No 27EQ'}
          </Typography>
        }
        data = {data}
        columns = {columns}
        onPageChange = {(page) => handlePageChange(page)}
        onPageSizeChange = {(size) => handlePageSizeChange(size)}
        rowCount = {numRows}
        requestSearch = {(event) => requestSearch(event)}
        cancelSearch = {cancelSearch}
        searchVal = {pagination.searchString}
        type = 'filter'
        isApiFinished = {true}
      />
    </>
  )

}

export default Form27EQReport