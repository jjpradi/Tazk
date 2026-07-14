import { Button, Dialog, Grid, TextField, Typography } from '@mui/material'
import DataGridTemp from 'components/dataGridTemp'
import React, { useState } from 'react'
import ServiceDataGrid from './serviceDataGrid'

export default function CustomerIntraction() {

  const [form, setForm] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const handleAdd = () => {
    setForm(true)
  };

  return (
    <div style={{ background: '#edb4b400' }}>
      <ServiceDataGrid />
    </div>
  )
}
