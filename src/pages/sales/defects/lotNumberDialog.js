import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useState } from "react"
import { CloseOutlined, DeleteOutlined, DoneOutlined, EditOutlined, PostAdd } from "@mui/icons-material"
import { useDispatch, useSelector } from "react-redux"
import { ErrorAlert } from "redux/actions/load"
import { getLotsDetailsForDefectsAction } from "redux/actions/defects_actions"
import PropTypes from 'prop-types'
import { getLotDetailsAction } from "redux/actions/sales_actions"
import PrintLabel from '../purchases/PrintLabel'

function LotNumberDialog(props) {

    const dispatch = useDispatch()

    const {
        purchasesReducer: { pot_code_seq }
    } = useSelector(state => state)

    const [filter, setFilter] = useState([0])
    const [formValues, setFormValues] = useState({})
    const [lotNumber, setLotNumber] = useState(null)
    const [lotNumberError, setLotNumberError] = useState(null)
    const [errorLots, setErrorLots] = useState({})
    const [index, setIndex] = useState(null)
    const [countVal, setCountVal] = useState(0)
    const [validatedLots, setValidatedLots] = useState({})
    const [labelType, setLabelType] = useState('qrCode')

    useEffect(() => {
        if (props.data.lots.length > 0) {
            const updatedFormValues = {}
            const updatedErrorLots = {}
            let updatedFilter = [0]
            props.data.lots.forEach((d, i) => {
                if(props.calledFrom === 'sendDefects'){
                    const lotData = props.data.lots[i]
                    lotData.item_cost_price = props.data.item_cost_price
                    lotData.tax_amount = props.data.tax_amount
                    lotData.receiving_id = props.data.receiving_id
                    lotData.bill_number = props.data.bill_number
                    lotData.bill_date = props.data.receiving_time
                    lotData.location_id = props.data.location_id
                    lotData.item_id = props.data.item_id
                    updatedFormValues[`text${i}`] = lotData || {}
                }
                else if(props.calledFrom === 'defectsLotSearch'){
                    const lotData = props.data.lots[i]
                    lotData.item_unit_price = props.data.item_unit_price
                    lotData.tax_amount = props.data.tax_amount
                    lotData.sale_id = props.data.sale_id
                    lotData.invoice_number = props.data.invoice_number
                    lotData.invoice_date = props.data.sale_time
                    lotData.location_id = props.data.location_id
                    lotData.item_id = props.data.item_id
                    updatedFormValues[`text${i}`] = lotData || {}
                }
                else{
                    updatedFormValues[`text${i}`] = props.data.lots[i] || {}
                }
                updatedErrorLots[`text${i}`] = false
                updatedFilter = [...updatedFilter, [...updatedFilter].pop() + 1]
            })
            setFormValues(updatedFormValues)
            setErrorLots(updatedErrorLots)
            setFilter(updatedFilter)
            setCountVal(props.data.lots.length)
        }

        if(props.data.calledFrom === 'vendorReplacement'){
            if(Number(props.data.quantity) > 0){
                dispatch(potCodeAction(Number(props.data.quantity)))
            }
        }
    }, [props.data])

    const handleChange = (event) => {
        const value = event.target.value
        setLotNumber(value)

        if (value === '') {
            setLotNumberError('REQUIRED')
        }
        else {
            setLotNumberError(null)
        }
    }

    const handleClose = () => {
        setFilter([0])
        setFormValues({})
        setLotNumber(null)
        setLotNumber(null)
        setErrorLots({})
        setIndex(null)
        setCountVal(0)
        setValidatedLots({})
        props.handleClose()
    }

    const validateAndFetchLotDetails = async (data, value) => {
        return new Promise((resolve, reject) => {
            const payload ={
                lot_number: value,
                location_id: data.location_id,
                sale_id: data.sale_id,
                calledFrom: data.calledFrom,
                item_id: data.item_id,
                receiving_id: data.receiving_id,
                customer_id: data.customer_id,
                supplier_id: data.supplier_id
            }

            if (data.calledFrom === 'customerReplacement') {
                dispatch(getLotDetailsAction(payload, (res) => {
                    if (res?.message) {
                        ErrorAlert(dispatch, { message: res.message })
                    }
    
                    if(res && res.length){
                        resolve(res)
                    }
                    else {
                        reject('INVALID')
                    }
                }))
            }
            else {
                payload['calledFrom'] = data.calledFrom
                dispatch(getLotsDetailsForDefectsAction(payload, (res) => {
                    if (res?.message) {
                        ErrorAlert(dispatch, { message: res.message })
                    }
    
                    if(res && res.length){
                        resolve(res)
                    }
                    else {
                        if(res?.status === 'Already Lot Exist in Defect'){
                            reject('DEFECT_LOT_EXIST')
                            return
                        }
                        reject('INVALID')
                    }
                }))
            }
        })
    }

    const lotCheck = (data) => {
        if (props.calledFrom === 'defectsLotSearch' && data.sale_id !== null) {
            return data.status === 'S'
        }
        else if (props.calledFrom === 'customerReplacement') {
            return data.status === 'A'
        }
        else {
            return true
        }
    }

    const findUnique = (name, input, lotDetails = [], updatedFormValues, type = 'new') => {
        let lotValid = {
            isValid: true,
            lot_id: '',
            trans_items_cost_price: '',
            item_unit_price: '',
            item_cost_price: '',
            tax_amount: '',
            sale_id: '',
            invoice_number: '',
            invoice_date: '',
            receiving_id: '',
            bill_number: '',
            bill_date: '',
            location_id: '',
            item_id: ''
        }
console.log(lotDetails, 'lotDetails')
        const apiLot = lotDetails.find(lot => lot.lot_number === input.toString() && lotCheck(lot))
        console.log(apiLot, 'apiLot lotDetails')
        if (apiLot) {
            lotValid.isValid = false
            lotValid.lot_id = apiLot.lot_id
            lotValid.trans_items_cost_price = apiLot.trans_items_cost_price
            if(props.calledFrom === 'defectsLotSearch'){
                lotValid.item_unit_price = apiLot.item_unit_price
                lotValid.tax_amount = apiLot.tax_amount
                lotValid.sale_id = apiLot.sale_id
                lotValid.invoice_number = apiLot.invoice_number
                lotValid.invoice_date = apiLot.sale_time
                lotValid.location_id = apiLot.location_id
                lotValid.item_id = apiLot.item_id
            }
            else if(props.calledFrom === 'sendDefects'){
                lotValid.item_cost_price = apiLot.item_cost_price
                lotValid.tax_amount = apiLot.tax_amount
                lotValid.receiving_id = apiLot.receiving_id
                lotValid.bill_number = apiLot.bill_number
                lotValid.bill_date = apiLot.receiving_time
                lotValid.location_id = apiLot.location_id
                lotValid.item_id = apiLot.item_id
            }
        }

        const lotValues = updatedFormValues ? updatedFormValues : formValues

        for (const key in lotValues) {
            const val = lotValues[key]
            if(key !== name && val.lot_number === input && type !== 'edit'){
                lotValid.isValid = true
            }
            else {
                lotValid.isValid = false
            }
        }

        return lotValid
    }

    const addData = async (type) => {
        const trimmedLotNumber = lotNumber?.toString()?.trim()

        if (!trimmedLotNumber || trimmedLotNumber === 'null') {
            setLotNumberError('REQUIRED')
            return
        }

        try {
            const lot = await validateAndFetchLotDetails({
                location_id: props.location_id,
                sale_id: props.sale_id,
                item_id: props.calledFrom === 'customerReplacement' ? props.data.replacing_item_id : props.data.item_id,
                calledFrom: props.calledFrom,
                receiving_id: props.data.receiving_id,
                customer_id: props.customer_id,
                supplier_id: props.supplier_id
            }, trimmedLotNumber)

            const key = type === 'new' ? `text${[...filter].pop()}` : `text${index}`
            const lots = findUnique(key, trimmedLotNumber, lot)
console.log(lots, 'lots', lot)
            if (lots.isValid) {
                setLotNumberError('INVALID')
                return
            }

            if(props.calledFrom === 'defectsLotSearch'){
                setFormValues((prev) => ({
                    ...prev,
                    [key]: {
                        ...prev[key],
                        lot_number: trimmedLotNumber,
                        lot_id: lots.lot_id,
                        trans_items_cost_price: lots.trans_items_cost_price,
                        unit_price: lots.item_unit_price + (lots.tax_amount ?? 0),
                        sale_id: lots.sale_id,
                        invoice_number: lots.invoice_number,
                        invoice_date: lots.invoice_date,
                        location_id: lots.location_id,
                        item_id: lots.item_id
                    }
                }))
            }
            else if(props.calledFrom === 'sendDefects'){
                setFormValues((prev) => ({
                    ...prev,
                    [key]: {
                        ...prev[key],
                        lot_number: trimmedLotNumber,
                        lot_id: lots.lot_id,
                        trans_items_cost_price: lots.trans_items_cost_price,
                        cost_price: lots.item_cost_price + (lots.tax_amount ?? 0),
                        receiving_id: lots.receiving_id,
                        bill_number: lots.bill_number,
                        bill_date: lots.bill_date,
                        location_id: lots.location_id,
                        item_id: lots.item_id
                    }
                }))
            }
            else if(props.calledFrom === 'customerReplacement'){
                if(props.replacementItems.some(d => d.lots.some(s => s.lot_number === trimmedLotNumber))){
                    setLotNumberError('ALREADY EXIST')
                    return
                }
                else{
                    setFormValues((prev) => ({
                        ...prev,
                        [key]: {
                            ...prev[key],
                            lot_number: trimmedLotNumber,
                            lot_id: lots.lot_id,
                            trans_items_cost_price: lots.trans_items_cost_price
                        }
                    }))
                }
            }
            else{
                setFormValues((prev) => ({
                    ...prev,
                    [key]: {
                        ...prev[key],
                        lot_number: trimmedLotNumber,
                        lot_id: lots.lot_id,
                        trans_items_cost_price: lots.trans_items_cost_price
                    }
                }))
            }

            if (type === 'new') {
                if (Number(props.data.quantity) !== countVal) {
                    setCountVal(countVal + 1)
                }
                setFilter([...filter, [...filter].pop() + 1])
            }
            setLotNumber(null)
            setLotNumberError(null)
            setIndex(null)
        }
        catch (err) {
            setLotNumberError(err)
        }
    }

    const editDataValidateAndSave = async (lotKey) => {
        const lotValue = formValues[lotKey]?.lot_number?.trim()

        if (!lotValue) {
            setErrorLots((prev) => ({ ...prev, [lotKey]: 'REQUIRED' }))
            return
        }

        // if(props.calledFrom === 'defectsLotSearch'){
        //     setFormValues((prev) => ({
        //         ...prev,
        //         [lotKey]: {
        //             ...prev[lotKey],
        //             lot_number: lotNumber,
        //             item_id: props.data.item_id
        //         }
        //     }))
        // }
        // else{

        // }
        let res = []
        
        if (props.calledFrom === 'customerReplacement') {
            const payload ={
                lot_number: lotValue,
                location_id: props.location_id,
                sale_id: props.sale_id,
                item_id: props.calledFrom === 'customerReplacement' ? props.data.replacing_item_id : props.data.item_id,
                calledFrom: props.calledFrom === 'customerReplacement' ? 'sales' : props.calledFrom,
                receiving_id: props.data.receiving_id,
                customer_id: props.customer_id,
                supplier_id: props.supplier_id
            }
    
            const response = await new Promise((resolve) => {
                if (props.calledFrom === 'customerReplacement') {
                    dispatch(getLotDetailsAction(payload, (res) => resolve(res)))
                }
            })
            res = response
        }

        if(props.calledFrom !== 'defectsLotSearch' && res?.status === 'Already Lot Exist in Defect'){
            setErrorLots((prev) => ({ ...prev, [lotKey]: 'DEFECT_LOT_EXIST' }))
            return  
        }

        if (props.calledFrom !== 'defectsLotSearch' && (!res || res.length === 0)) {
            setErrorLots((prev) => ({ ...prev, [lotKey]: 'INVALID' }))
            return
        }

        const result = findUnique(lotKey, lotValue, res, formValues, 'edit')

        if (result.isValid) {
            setErrorLots((prev) => ({ ...prev, [lotKey]: 'INVALID' }))
            return
        }

        if(props.calledFrom === 'defectsLotSearch'){
            setFormValues((prev) => ({
                ...prev,
                [lotKey]: {
                    ...prev[lotKey],
                    lot_number: lotValue,
                    item_id: props.data.item_id
                }
            }))
        }
        else if(props.calledFrom === 'sendDefects'){
            setFormValues((prev) => ({
                ...prev,
                [lotKey]: {
                    ...prev[lotKey],
                    lot_number: lotValue,
                    lot_id: result.lot_id,
                    trans_items_cost_price: result.trans_items_cost_price,
                    cost_price: result.item_cost_price + (result.tax_amount ?? 0),
                    receiving_id: result.receiving_id,
                    bill_number: result.bill_number,
                    bill_date: result.bill_date,
                    location_id: result.location_id,
                    item_id: result.item_id
                }
            }))
        }
        else if(props.calledFrom === 'customerReplacement'){
            if(props.replacementItems.filter(d => d.line !== props.data.line).some(s => s.lots.some(f => f.lot_number === lotValue))){
                setErrorLots((prev) => ({ ...prev, [lotKey]: 'ALREADY EXIST' }))
                return
            }
            else{
                setFormValues((prev) => ({
                    ...prev,
                    [lotKey]: {
                        ...prev[lotKey],
                        lot_number: lotValue,
                        lot_id: result.lot_id,
                        trans_items_cost_price: result.trans_items_cost_price
                    }
                }))
            }
        }
        else{
            setFormValues((prev) => ({
                ...prev,
                [lotKey]: {
                    ...prev[lotKey],
                    lot_number: lotValue,
                    lot_id: result.lot_id,
                    trans_items_cost_price: result.trans_items_cost_price
                }
            }))
        }
        setLotNumber(null)
        setIndex(null)
        setErrorLots((prev) => ({ ...prev, [lotKey]: null }))
    }

    const cancelEdit = (lot) => {
        setFormValues((prev) => ({ ...prev, [lot]: { ...prev[lot], lot_number: lotNumber } }))
        setLotNumber(null)
        setIndex(null)
        setErrorLots({})
    }

    const deleteData = (index) => {
        const updatedFilter = [...filter]
        const updatedFormValues = { ...formValues }

        const keyToRemove = `text${updatedFilter[index]}`
        delete updatedFormValues[keyToRemove]
        updatedFilter.splice(index, 1)
        const validCount = Object.values(updatedFormValues).filter(val => val?.lot_number?.trim()).length

        setFilter(updatedFilter)
        setFormValues(updatedFormValues)
        setCountVal(validCount)
    }

    const handleEdit = (index, key) => {
        setIndex(index)
        setLotNumber(formValues[key].lot_number)
    }

    const handleSubmit = async() => {
        let isValid = true
        const last = props.data

        for (const key in errorLots) {
            if (errorLots[key]) {
                isValid = false
            }
        }

        if (index !== null) {
            isValid = false
        }

        if (Number(props.calledFrom === 'customerReplacement' || props.calledFrom === 'vendorReplacement' ? props.data.replacingQuantity : props.data.quantity) !== Object.keys(formValues).length) {
            isValid = false
        }

        if (isValid) {
            if (props.calledFrom === 'customerReplacement' || props.calledFrom === 'vendorReplacement') {
                last.lots = Object.values(formValues).map(d => d)
                const updatedReplacementItems = [...props.replacementItems]
                const index = last.line - 1
                updatedReplacementItems[index] = last
                props.setFormValues((prev) => ({ ...prev, replacementItems: updatedReplacementItems }))
                handleClose()
            }
            else if(props.calledFrom === 'defectsLotSearch'){
                let updatedDefectiveItems = [...props.defectiveItems]
                const values = Object.values(formValues).map(d => d)
                let loopCount = 1
                for await(const val of values){
                    if (updatedDefectiveItems.some(item => item.item_id === val.item_id && item.sale_id === '')) {
                        const product = updatedDefectiveItems.find(item => item.item_id === val.item_id && item.sale_id === '')
                        const newQuantity = 1
                        const updatedItem = {
                            ...product,
                            quantity: newQuantity,
                            sale_id: val.sale_id,
                            invoice_number: val.invoice_number,
                            invoice_date: val.sale_time,
                            item_unit_price: val.unit_price,
                            location_id: val.location_id,
                            lots: [{
                                lot_number: val.lot_number,
                                lot_id: val.lot_id,
                                trans_items_cost_price: val.trans_items_cost_price
                            }],
                            proofOfPurchase: product.proofOfPurchase ?? []
                        }
                        const updatedDefectiveItem = updatedDefectiveItems.map((item) => {
                            if (item.item_id === val.item_id && item.sale_id === '') {
                                return updatedItem
                            }
                            else {
                                return item
                            }
                        })
                        updatedDefectiveItems = updatedDefectiveItem
                    }
                    else if (updatedDefectiveItems.some(item => item.item_id === val.item_id && item.sale_id === val.sale_id)) {
                        const product = updatedDefectiveItems.find(item => item.item_id === val.item_id && item.sale_id === val.sale_id)
                        if(product.lots.length > 0 && loopCount === 1){
                            delete product.lots
                            loopCount += 1
                        }
                        const newQuantity = (product?.lots?.length ?? 0) + 1
                        const updatedItem = {
                            ...product,
                            quantity: newQuantity,
                            sale_id: val.sale_id,
                            invoice_number: val.invoice_number,
                            invoice_date: val.sale_time,
                            item_unit_price: val.unit_price,
                            location_id: val.location_id,
                            lots: product.lots ? [...product.lots, {
                                lot_number: val.lot_number,
                                lot_id: val.lot_id,
                                trans_items_cost_price: val.trans_items_cost_price
                            }] : [{
                                lot_number: val.lot_number,
                                lot_id: val.lot_id,
                                trans_items_cost_price: val.trans_items_cost_price
                            }]
                        }
                        const updatedDefectiveItem = updatedDefectiveItems.map((item) => {
                            if (item.item_id === val.item_id && item.sale_id === val.sale_id) {
                                return updatedItem
                            }
                            else {
                                return item
                            }
                        })
                        updatedDefectiveItems = updatedDefectiveItem
                    }
                    else{
                        const product = updatedDefectiveItems.find(item => item.item_id === val.item_id)
                        const newQuantity = 1
                        const updatedItem = {
                            ...product,
                            quantity: newQuantity,
                            sale_id: val.sale_id,
                            invoice_number: val.invoice_number,
                            invoice_date: val.sale_time,
                            item_unit_price: val.unit_price,
                            location_id: val.location_id,
                            lots: [{
                                lot_number: val.lot_number,
                                lot_id: val.lot_id,
                                trans_items_cost_price: val.trans_items_cost_price
                            }]
                        }
                        updatedDefectiveItems.push(updatedItem)
                    }
                }
                props.setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                handleClose()
            }
            else if(props.calledFrom === 'sendDefects'){
                let updatedDefectiveItems = [...props.defectiveItems]
                const values = Object.values(formValues).map(d => d)
                let loopCount = 1
                for await(const val of values){
                    if (updatedDefectiveItems.some(item => item.item_id === val.item_id && item.receiving_id === '')) {
                        const product = updatedDefectiveItems.find(item => item.item_id === val.item_id && item.receiving_id === '')
                        const newQuantity = 1
                        const updatedItem = {
                            ...product,
                            quantity: newQuantity,
                            receiving_id: val.receiving_id,
                            bill_number: val.bill_number,
                            bill_date: val.bill_date,
                            item_cost_price: val.cost_price,
                            location_id: val.location_id,
                            lots: [{
                                lot_number: val.lot_number,
                                lot_id: val.lot_id,
                                trans_items_cost_price: val.trans_items_cost_price
                            }]
                        }
                        const updatedDefectiveItem = updatedDefectiveItems.map((item) => {
                            if (item.item_id === val.item_id && item.receiving_id === '') {
                                return updatedItem
                            }
                            else {
                                return item
                            }
                        })
                        updatedDefectiveItems = updatedDefectiveItem
                    }
                    else if (updatedDefectiveItems.some(item => item.item_id === val.item_id && item.receiving_id === val.receiving_id)) {
                        const product = updatedDefectiveItems.find(item => item.item_id === val.item_id && item.receiving_id === val.receiving_id)
                        if(product.lots.length > 0 && loopCount === 1){
                            delete product.lots
                            loopCount += 1
                        }
                        const newQuantity = (product.lots?.length ?? 0) + 1
                        const updatedItem = {
                            ...product,
                            receiving_id: val.receiving_id,
                            bill_number: val.bill_number,
                            bill_date: val?.bill_date || '',
                            item_cost_price: val?.cost_price ?? val.trans_items_cost_price,
                            location_id: val.location_id,
                            lots: product.lots ? [...product.lots, {
                                lot_number: val.lot_number,
                                lot_id: val.lot_id,
                                trans_items_cost_price: val.trans_items_cost_price
                            }] : [{
                                lot_number: val.lot_number,
                                lot_id: val.lot_id,
                                trans_items_cost_price: val.trans_items_cost_price
                            }]
                        }
                        const updatedDefectiveItem = updatedDefectiveItems.map((item) => {
                            if (item.item_id === val.item_id && item.receiving_id === val.receiving_id) {
                                return updatedItem
                            }
                            else {
                                return item
                            }
                        })
                        updatedDefectiveItems = updatedDefectiveItem
                    }
                    else{
                        const product = updatedDefectiveItems.find(item => item.item_id === val.item_id)
                        const newQuantity = 1
                        const updatedItem = {
                            ...product,
                            quantity: newQuantity,
                            receiving_id: val.receiving_id,
                            bill_number: val.bill_number,
                            bill_date: val.bill_date,
                            item_cost_price: val.cost_price,
                            location_id: val.location_id,
                            lots: [{
                                lot_number: val.lot_number,
                                lot_id: val.lot_id,
                                trans_items_cost_price: val.trans_items_cost_price
                            }]
                        }
                        updatedDefectiveItems.push(updatedItem)
                    }
                }
                props.setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                handleClose()
            }
            else {
                last.lots = Object.values(formValues).map(d => d)
                const updatedDefectiveItems = [...props.defectiveItems]
                const index = last.line - 1
                updatedDefectiveItems[index] = last
                props.setFormValues((prev) => ({ ...prev, defectiveItems: updatedDefectiveItems }))
                handleClose()
            }
        }
    }

    const addReceivingLot = () => {
        const trimmedLotNumber = lotNumber?.toString()?.trim()
        if (!trimmedLotNumber || trimmedLotNumber === 'null') {
            setLotNumberError('REQUIRED')
            return
        }

        if (Number(props.data.quantity) === Object.keys(formValues).length) {
            return;
        }

        if(props.calledFrom === 'defectsLotSearch'){
            if(props.defectiveItems.filter(d => d.item_id === props.data.item_id).some(d => d.lots.some(l => l.lot_number === lotNumber)) || Object.values(formValues).some(d => d.lot_number === lotNumber)){
                setLotNumberError('DEFECT_LOT_EXIST')
            }
            else{
                const getLast = [...filter].pop()
                setFormValues((prev) => ({
                    ...prev,
                    [`text${getLast}`]: {
                        ...prev[`text${getLast}`],
                        lot_number: lotNumber,
                        item_id: props.data.item_id
                    }
                }))
                setCountVal(countVal + 1)
                setLotNumber(null)
                setIndex(null)
                setErrorLots((prev) => ({ ...prev, [`text${getLast}`]: null }))
                setFilter([...filter, getLast + 1])
            }
        }
        else{
            dispatch(getLotsDetailsForDefectsAction({ lot_number: lotNumber, calledFrom: 'vendorReplacement' }, (res) => {
                if(res.status === 'Lot Number Already Exist in Inventory'){
                    setLotNumberError('EXIST INVENTORY')
                    return
                }
                else{
                    const getLast = [...filter].pop()
                    setFormValues((prev) => ({
                        ...prev,
                        [`text${getLast}`]: {
                            ...prev[`text${getLast}`],
                            lot_number: lotNumber
                        }
                    }))
                    setCountVal(countVal + 1)
                    setLotNumber(null)
                    setIndex(null)
                    setErrorLots((prev) => ({ ...prev, [`text${getLast}`]: null }))
                    setFilter([...filter, getLast + 1])
                }
            }))
        }
    }

    // const serialPopClose = () => {
    //     handleClose()
    // };

    const enteredVal = (data = formValues) => {
        let count = 0;
        for (let key in data) {
            if (data[key].lot_number) {
                count += 1;
            }
        }
        return count;
    };

    const potCodeSubmit = (data, current_seq, sequence_id, type) => {
        const last = props.data;

        last.lots = data;

        last.quantity = enteredVal(data);
            // const full = [...props.itemsData];
            // const index = last.line - 1;
            // full[index] = last;
            // props.setitemsData(full);

        const updatedReplacementItems = [...props.replacementItems]
        const index = last.line - 1
        updatedReplacementItems[index] = last
        props.setFormValues((prev) => ({ ...prev, replacementItems: updatedReplacementItems }))    }

    return (
        <Dialog open={props.open} maxWidth='sm' fullWidth>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <Grid container spacing={3} justifyContent='space-between' alignItems='center'>
                            <Grid>
                                <Typography variant='h6' textAlign='center'>
                                    {`Serial / Lot Number (Count ${countVal}/${props.calledFrom === 'customerReplacement' ? props.data.replacingQuantity : props.data.quantity})`}
                                </Typography>
                            </Grid>

                            {
                                props.calledFrom === 'vendorReplacement' &&
                                <Grid>
                                    <Box style={{ height: 30 ,width:130,marginLeft:'1px',borderRadius:'20px'}}>
                                        <FormControl fullWidth>
                                        <InputLabel >Select</InputLabel>
                                        <Select  style={{ height: 30 }}
                                            value= {labelType}
                                            label='BarCode'
                                            onChange={(e)=>{
                                                setLabelType(e.target.value);
                                            }}
                                        >
                                            <MenuItem value={'barCode'}>BarCode</MenuItem>
                                            <MenuItem value={'qrCode'}>QrCode</MenuItem>
                                            
                                        </Select>
                                        </FormControl>
                                    </Box>
                                </Grid>
                            }

                            {
                                props.calledFrom === 'vendorReplacement' &&
                                <Grid>
                                    <PrintLabel
                                        pot_code_seq={pot_code_seq}
                                        formValues={formValues}
                                        row_id={{data: { ...props.data, received_quantity: props.data.quantity, receiving_quantity: props.data.quantity - countVal, ordered_quantity: props.data.quantity, item_unit_price: 0 }}}
                                        potCodeSubmit={potCodeSubmit}
                                        serialPopClose={handleClose}
                                        labelType={labelType}
                                    />
                                </Grid>
                            }

                            <Grid>
                                <IconButton onClick={() => handleClose()}>
                                    <CloseIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid display='flex' size={12}>
                        <TextField
                            label='Serial / Lot Number'
                            value={index === null ? lotNumber ?? '' : ''}
                            fullWidth
                            disabled={Number(props.calledFrom === 'customerReplacement' ? props.data.replacingQuantity : props.data.quantity) === countVal}
                            onChange={handleChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && index === null){
                                    event.preventDefault()

                                    if (!lotNumber) {
                                        setLotNumberError('REQUIRED')
                                    }
                                    else {
                                        if (props.calledFrom === 'vendorReplacement') {
                                            addReceivingLot()
                                        }
                                        else {
                                            addData('new')
                                        }
                                    }
                                }
                            }}
                            error={lotNumberError}
                            helperText={lotNumberError === 'QUANTITY' ? 'Enter Product Quantity' : lotNumberError === 'ENTERVALUE' ? 'Please click enter to validate' : lotNumberError === 'DEFECT_LOT_EXIST' ? 'Already Lot Exist in Defect' : lotNumberError === 'INVALID' ? 'Serial/Lot Number is Invalid' : lotNumberError === 'REQUIRED' ? 'Serial/Lot Number is Required' : lotNumberError === 'EXIST INVENTORY' ? 'Lot Number Already Exist in Inventory' : lotNumberError === 'ALREADY EXIST' ? 'Lot Already Exist' : ''}
                        />

                        <PostAdd
                            style={{
                                margin: '0px 10px',
                                cursor: Number(props.calledFrom === 'customerReplacement' ? props.data.replacingQuantity : props.data.quantity) === Object.keys(formValues).length ? 'default' : 'pointer'
                            }}
                            color={Number(props.calledFrom === 'customerReplacement' ? props.data.replacingQuantity : props.data.quantity) === countVal ? 'disabled' : 'primary'}
                            onClick={() => {
                                if (Number(props.calledFrom === 'customerReplacement' ? props.data.replacingQuantity : props.data.quantity) !== Object.keys(formValues).length && index === null) {
                                    if (props.calledFrom === 'vendorReplacement') {
                                        addReceivingLot()
                                    }
                                    else {
                                        addData('new')
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {
                        Object.keys(formValues).length > 0 ?
                            Object.keys(formValues).map((lot, i) => (
                                <Grid display='flex' alignItems='center' key={lot} size={12}>
                                    <TextField
                                        value={formValues[lot]?.lot_number || ''}
                                        disabled={index !== i}
                                        fullWidth
                                        onChange={async (event) => {
                                            if (index === i) {
                                                const newValue = event.target.value
                                                await setFormValues((prev) => ({ ...prev, [lot]: { ...prev[lot], lot_number: newValue } }))
                                                setErrorLots((prev) => ({ ...prev, [lot]: null }))
                                                setValidatedLots((prev) => ({ ...prev, [lot]: false }))
                                            }
                                        }}
                                        onKeyDown={async (event) => {
                                            if (event.key === 'Enter' && index === i) {
                                                event.preventDefault()
                                                await editDataValidateAndSave(lot)
                                            }
                                        }}
                                        error={errorLots[lot]}
                                        helperText={errorLots[lot] === 'QUANTITY' ? 'Enter Product Quantity' : errorLots[lot] === 'ENTERVALUE' ? 'Please click enter to validate' : errorLots[lot] === 'INVALID' ? 'Serial/Lot Number is Invalid' : errorLots[lot] === 'REQUIRED' ? 'Serial/Lot Number is Required' : errorLots[lot] === 'DEFECT_LOT_EXIST' ? 'Already Lot Exist in Defect' : errorLots[lot] === 'EXIST INVENTORY' ? 'Lot Number Already Exist in Inventory' : errorLots[lot] === 'ALREADY EXIST' ? 'Lot Already Exist' : ''}
                                    />

                                    {
                                        index !== null && index === i &&
                                        <CloseOutlined
                                            color='error'
                                            onClick={() => cancelEdit(lot)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    }

                                    {
                                        index !== null && index === i &&
                                        <DoneOutlined
                                            color='success'
                                            onClick={() => editDataValidateAndSave(lot)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    }

                                    {
                                        (index === null || index !== i) &&
                                        <DeleteOutlined
                                            color='error'
                                            onClick={() => deleteData(i)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    }

                                    {
                                        (index === null || index !== i) && props.calledFrom !== 'vendorReplacement' &&
                                        <EditOutlined
                                            color='primary'
                                            onClick={() => handleEdit(i, lot)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    }
                                </Grid>
                            ))
                        : null
                    }
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container spacing={3} justifyContent='flex-end'>
                    <Grid>
                        <Button variant='contained' color='error' onClick={() => handleClose()}>Cancel</Button>
                    </Grid>

                    <Grid>
                        <Button variant='contained' onClick={handleSubmit} disabled={Number(props.calledFrom === 'customerReplacement' ? props.data.replacingQuantity : props.data.quantity) !== countVal}>Submit</Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}

LotNumberDialog.propTypes = {
    handleClose: PropTypes.func,
    calledFrom: PropTypes.string,
    location_id: PropTypes.number,
    sale_id: PropTypes.number,
    customer_id: PropTypes.number,
    data: PropTypes.object,
    defectiveItems: PropTypes.array,
    replacementItems: PropTypes.array,
    setFormValues: PropTypes.func,
    open: PropTypes.bool
}

export default LotNumberDialog