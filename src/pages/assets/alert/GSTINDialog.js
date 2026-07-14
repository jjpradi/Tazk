import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from "@mui/material";
import { ErrorOutlineIcon } from "pages/routesIcons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listCustomerSalesManAction, SalesmaninsertAction } from "redux/actions/customer_actions";
import { ErrorAlert } from "redux/actions/load";

function GSTINDialog({ open, onClose, missingGSTINTypeRows = [], invalidGSTINTypeRows = [], missingRequiredRows = [], validRows = [], unmatchedSalesmenList = [], handleCloseDialog, headerLocationId, Bulkinsert, type,allClose,uploadClose, pincodeInvalidRows = []}) {
    // console.log(missingRequiredRows, invalidGSTINTypeRows, missingGSTINTypeRows, "missingRequiredRows1")
    // console.log(Array.isArray(validRows) , validRows , invalidGSTINTypeRows,  "invalidGSTINTypeRows")

    const [filteredValidRows, setFilteredValidRows] = useState([]);
    const [invalidGSTINRows, setInvalidGSTINRows] = useState([invalidGSTINTypeRows.length > 0 ? [...invalidGSTINTypeRows] : []]);

    let dispatch = useDispatch();
    // const  {
    //     customerReducer: { customer_mapping } } = useSelector((state) => state);

    const allowedGSTINTypes = new Set([
         "REG", "CMP", "URB", "SEZ", "CTP", "NRTP", "ISD", "ECO", "TDS", "GOVUIN"
    ].map(type => type.toLowerCase()));

    useEffect(() => {
        if (Array.isArray(validRows) && validRows.length > 0) {
            const gstinRegex = /^(0[1-9]|1[0-9]|2[0-9]|3[0-7])[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
            let newInvalidGSTINRows = [];
    
            const validFilteredRows = validRows.filter(row => {
                if (!row.GSTIN) return true; 
                
                if (!gstinRegex.test(row.GSTIN)) {
                  newInvalidGSTINRows.push({
                    companyName: row["Company Name"],
                    gstin: row["GSTIN"],
                    gstintype: row["GSTIN Type"]
                  }); 
                  return false;
                }
    
                if (!row["GSTIN Type"]) return false; 
    
                return allowedGSTINTypes.has(row["GSTIN Type"].toLowerCase());
            });
    
            setFilteredValidRows(validFilteredRows);
            setInvalidGSTINRows([...invalidGSTINTypeRows, ...newInvalidGSTINRows]);
        }
    }, [validRows, invalidGSTINTypeRows]);

    // const handleUploadValidRows = async () => {
    //     try {
    //         const data = { customer: "null" };

    //         const gstTypeMapping = {
    //             "REG": 1,
    //             "CMP": 2,
    //             "URB": 3,
    //             "SEZ": 4,
    //             "CTP": 5,
    //             "NRTP": 6,
    //             "ISD": 7,
    //             "ECO": 8,
    //             "TDS": 9,
    //             "GOVUIN": 10
    //         };
        
    //         // const temp_1_xl_data = type === 0 ? filteredValidRows.filter(i => i["Zip Code"] && i["State"] && i["First Name"] && i["Gender"]) : 
    //         // type === 1 ? filteredValidRows.filter(i => i["Company Name"]  && i["Zip Code"] && i["State"] && i["First Name"] && i["Gender"]) : 
    //         // type === 2 ? filteredValidRows.filter(i => i["Company Name"] && i["Zip Code"] && i["State"] && i["First Name"] && i["Gender"]) : ''
    //         const temp_1_xl_data =
    //             type === 0
    //                 ? filteredValidRows.filter(i =>
    //                     i["Zip Code"] &&
    //                     i["State"] &&
    //                     i["First Name"] &&
    //                     i["Gender"]
    //                 )
    //                 : type === 1 || type === 2
    //                     ? filteredValidRows.filter(i =>
    //                         i["Company Name"] &&
    //                         i["Zip Code"] &&
    //                         i["State"] &&
    //                         i["First Name"] &&
    //                         i["Gender"] &&
    //                         Number(i["Opening Balance"]) > 0   // 🔥 restrict only + amount
    //                     )
    //                     : [];
    //         console.log(temp_1_xl_data, "temp_1_xl_data")
    //         const xl_data = filteredValidRows.map((i) => {
    //             let rowData = {
    //             ['company_name']: i["Company Name"],
    //             ['first_name']:  i["First Name"] ? String(i["First Name"]).trim() : null,
    //             ['phone_number']: (i["Primary Contact"]),
    //             ['zip']: parseInt(i["Zip Code"]),
    //             ['city']: i["City"]?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
    //             ['state']: i["State"]?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
    //             ['country']: i["Country"]?.replace(/[^\w\s\r\n|\n|\r]/gm, '').trim(),
    //             ['credit_days']: parseInt(i["Credit Days"]) === undefined ? '' : parseInt(i["Credit Days"]),
    //             ['credit_value']: parseInt(i["Credit Limit"]) === undefined ? '' : parseInt(i["Credit Limit"]),
    //             ['tcs']: parseInt(i.tcs),
    //             ['taxable']: i["GSTIN"] === undefined ? 0 : i["GSTIN"]?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
    //             ['tax_id']: i["GSTIN"] === undefined ? null : i["GSTIN"]?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
    //             ['gender']: i["Gender"]?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim() === 'Male' ? parseInt(1) : parseInt(2),
    //             ['email']: i["Email"] === undefined ? " " : i["Email"],
    //             ['address']: i["Full Address"] === undefined ? null : i["Full Address"]?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
    //             ['area']: i.area === undefined ? null : i.area?.replace(/[^\w\s\r\n|\n|\r]/gm, "").trim(),
    //             ['customer_type']: type,
    //             ['amount']: i["Opening Balance"],
    //             ['debit']: type === 2 ? Math.sign(i["Opening Balance"]) === -1 ? (i["Opening Balance"]) : 0 : Math.sign(i["Opening Balance"]) === -1 ? 0 : (i["Opening Balance"]) * -1,
    //             ['credit']: type === 2 ? Math.sign(i["Opening Balance"]) === -1 ? 0 : (i["Opening Balance"]) : Math.sign(i["Opening Balance"]) === -1 ? (i["Opening Balance"]) * -1 : 0,
    //             ['location_id']: headerLocationId,
    //             ['gst_type']: i["GSTIN Type"] === undefined ? 0 : gstTypeMapping[i["GSTIN Type"].toUpperCase()],
    //            }
    //             if (type === 1) {
    //                 rowData['salesmanId_mapped'] = i["Salesman ID"] === undefined ? null : i["Salesman ID"];
    //             }

    //            return rowData;
    //         });

    //         setFilteredValidRows(xl_data);
        
    //         const responseBulkinsert = await Bulkinsert(xl_data);
    //         // await new Promise((resolve) => setTimeout(resolve, 1000));

    //         if (type === 1) {

    //             if (responseBulkinsert?.status === 200) {

    //                 const listCustomerSalesmanResponse = await dispatch(listCustomerSalesManAction(data));
            
    //                 if (!listCustomerSalesmanResponse || !listCustomerSalesmanResponse.data) {
    //                     console.error("Invalid response from listCustomerSalesManAction");
    //                     return;
    //                 }

    //                 const validEmployeeIds = [...new Set(xl_data.map(i => Number(i["salesmanId_mapped"])))];

    //                 const customerMapping = listCustomerSalesmanResponse.data.reduce((acc, item) => {
    //                     let { salesmanId_mapped, id } = item;
    //                     salesmanId_mapped = Number(salesmanId_mapped);

    //                     if (isNaN(salesmanId_mapped)) {
    //                         console.warn("Skipping entry due to invalid salesmanId", item);
    //                         return acc;
    //                     }

    //                     if (salesmanId_mapped === null || salesmanId_mapped === undefined) {
    //                         console.warn("Skipping entry due to null salesmanId", item);
    //                         return acc;
    //                     }
                
    //                     for (let i = 0; i < validEmployeeIds.length; i++) {
    //                         // console.log(salesmanId_mapped, "OPLLL");
    //                         if (validEmployeeIds[i] === salesmanId_mapped) {
                
    //                             if (!acc[salesmanId_mapped]) {
    //                                 acc[salesmanId_mapped] = [];
    //                             }
    //                             acc[salesmanId_mapped].push(id);
    //                         }
    //                     }
    //                     return acc;
    //                 }, {});
            
    //                 // console.log(customerMapping, "customerMapping");
            
    //                 const salesmanMap = new Map();

    //                 xl_data.forEach(i => {
    //                     const empId = i["salesmanId_mapped"];
    //                     if (!empId) return;

    //                     if (!salesmanMap.has(empId)) {
    //                         salesmanMap.set(empId, {
    //                             employee_id: empId,
    //                             customer_id: customerMapping[empId] || [],
    //                             previous_id: [],
    //                         });
    //                     }
    //                 });

    //                 const salesmanData = Array.from(salesmanMap.values());
            
    //                 const validSalesmanData = salesmanData.filter(s => s.customer_id.length > 0);

    //                 if (validSalesmanData.length > 0) {
    //                     await Promise.all(validSalesmanData.map(salesman => dispatch(SalesmaninsertAction(salesman))));
    //                 } else {
    //                     console.warn("No valid Salesman data to insert.");
    //                 }
    //             } else {
    //                 console.error("Bulkinsert failed, not calling listCustomerSalesManAction");
    //             }
            
    //         }

    //         setFilteredValidRows([]);
    //         setInvalidGSTINRows([]);
            
    //         onClose({
    //             missingGSTINTypeRows: [],
    //             invalidGSTINTypeRows: [],
    //             missingRequiredRows: [],
    //             validRows: [],
    //             matchedSalesmenList: [],
    //             unmatchedSalesmenList: []
    //         });
    //         uploadClose();
    //         allClose();
            
    //     } catch (error) {
    //         console.error("Error in handleUploadValidRows:", error);
    //     };
    // }

    const handleUploadValidRows = async () => {
    try {
        const data = { customer: "null" };

        const gstTypeMapping = {
            REG: 1,
            CMP: 2,
            URB: 3,
            SEZ: 4,
            CTP: 5,
            NRTP: 6,
            ISD: 7,
            ECO: 8,
            TDS: 9,
            GOVUIN: 10
        };

        /* ---------------- VALIDATION BASED ON TYPE ---------------- */

        const temp_1_xl_data =
            type === 0
                ? filteredValidRows.filter(i =>
                    i["Zip Code"] &&
                    i["State"] &&
                    i["First Name"] &&
                    i["Gender"]
                )
                : type === 1 || type === 2
                ? filteredValidRows.filter(i =>
                    i["Company Name"] &&
                    i["Zip Code"] &&
                    i["State"] &&
                    i["First Name"] &&
                    i["Gender"] &&
                    Number(i["Opening Balance"]) > 0   // 🔥 positive only
                )
                : [];

        if (temp_1_xl_data.length !== filteredValidRows.length) {
           // alert('hhhhhhhhhhhhhhhhhhhhhhhhh')
            ErrorAlert(dispatch, {
                message:
                    type === 0
                        ? "Required fields missing"
                        : "Company Name required and Opening Balance must be a positive amount"
            });
            return;
        }

        /* ---------------- PREPARE XL DATA ---------------- */

        const xl_data = temp_1_xl_data.map(i => {
            const openingBalance = Number(i["Opening Balance"]);

            const rowData = {
                company_name: i["Company Name"] || null,
                first_name: i["First Name"] ? String(i["First Name"]).trim() : null,
                phone_number: i["Primary Contact"],
                zip: parseInt(i["Zip Code"]),
                city: i["City"]?.replace(/[^\w\s\r\n]/gm, "").trim(),
                state: i["State"]?.replace(/[^\w\s\r\n]/gm, "").trim(),
                country: i["Country"]?.replace(/[^\w\s\r\n]/gm, "").trim(),
                credit_days: parseInt(i["Credit Days"]) || 0,
                credit_value: parseInt(i["Credit Limit"]) || 0,
                tcs: parseInt(i.tcs) || 0,
                taxable: i["GSTIN"] ? i["GSTIN"].trim() : 0,
                tax_id: i["GSTIN"] ? i["GSTIN"].trim() : null,
                gender:
                    i["Gender"]?.trim() === "Male" ? 1 : 2,
                email: i["Email"] || "",
                address: i["Full Address"]?.replace(/[^\w\s\r\n]/gm, "").trim() || null,
                area: i.area?.replace(/[^\w\s\r\n]/gm, "").trim() || null,
                customer_type: type,
                amount: openingBalance,
                debit: type === 2 ? 0 : openingBalance * -1,
                credit: type === 2 ? openingBalance : 0,
                location_id: headerLocationId,
                gst_type:
                    i["GSTIN Type"]
                        ? gstTypeMapping[i["GSTIN Type"].toUpperCase()] || 0
                        : 0
            };

            if (type === 1) {
                rowData.salesmanId_mapped = i["Salesman ID"] || null;
            }

            return rowData;
        });

        setFilteredValidRows(xl_data);

        /* ---------------- BULK INSERT ---------------- */

        const responseBulkinsert = await Bulkinsert(xl_data);

        /* ---------------- SALESMAN MAPPING (TYPE 1) ---------------- */

        if (type === 1 && responseBulkinsert?.status === 200) {
            const listCustomerSalesmanResponse =
                await dispatch(listCustomerSalesManAction(data));

            if (!listCustomerSalesmanResponse?.data) return;

            const validEmployeeIds = [
                ...new Set(xl_data.map(i => Number(i.salesmanId_mapped)))
            ];

            const customerMapping = listCustomerSalesmanResponse.data.reduce(
                (acc, item) => {
                    const empId = Number(item.salesmanId_mapped);
                    if (!empId) return acc;

                    acc[empId] = acc[empId] || [];
                    acc[empId].push(item.id);
                    return acc;
                },
                {}
            );

            const salesmanData = validEmployeeIds
                .filter(id => customerMapping[id]?.length)
                .map(id => ({
                    employee_id: id,
                    customer_id: customerMapping[id],
                    previous_id: []
                }));

            await Promise.all(
                salesmanData.map(s =>
                    dispatch(SalesmaninsertAction(s))
                )
            );
        }

        /* ---------------- CLEANUP ---------------- */

        setFilteredValidRows([]);
        setInvalidGSTINRows([]);

        onClose({
            missingGSTINTypeRows: [],
            invalidGSTINTypeRows: [],
            missingRequiredRows: [],
            validRows: [],
            matchedSalesmenList: [],
            unmatchedSalesmenList: []
        });

        uploadClose();
        allClose();

    } catch (error) {
        console.error("Error in handleUploadValidRows:", error);
    }
};


    const handleClose = () => {
        setFilteredValidRows([]);
        setInvalidGSTINRows([]);

        onClose({
            missingGSTINTypeRows: [],
            invalidGSTINTypeRows: [],
            missingRequiredRows: [],
            validRows: [],
            matchedSalesmenList: [],
            unmatchedSalesmenList: []
        });
        console.log(missingRequiredRows, "missingRequiredRows")
    };

    const allColumns = [
        "Company Name", "GSTIN", "GSTIN Type", "Full Address", "Zip Code", "City", 
        "State", "Country", "Credit Days", "Credit Limit", "First Name", "Gender", 
        "Primary Contact", "Email", "Salesman ID", "Opening Balance", "Opening Balance on"
    ];

    const requiredFields = ["Company Name", "Zip Code", "City", "State", "Country"];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>

            <DialogContent sx={{ padding: '20px' }}>
                {invalidGSTINRows?.length > 0 && (
                    <>
                    <Typography 
                        variant="h6" 
                        sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: "10px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        Invalid GST Details Cannot Be Processed for Upload
                        <ErrorOutlineIcon sx={{ color: 'red', fontSize: '18px', marginLeft: '5px' }} />
                    </Typography>
                    <TableContainer component={Paper} sx={{ marginBottom: "20px" }}>
                        <Table sx={{ minWidth: 600 }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontSize: '18px', fontWeight: 'bold' }}>Company Name</TableCell>
                                    <TableCell sx={{ fontSize: '18px', fontWeight: 'bold' }}>GSTIN</TableCell>
                                    <TableCell sx={{ fontSize: '18px', fontWeight: 'bold' }}>GSTIN Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invalidGSTINRows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ fontSize: '16px' }}>{row.companyName}</TableCell>
                                        <TableCell sx={{ fontSize: '16px' }}>{row.gstin}</TableCell>
                                        <TableCell sx={{ fontSize: '16px' }}>
                                            {row.gstintype === "" ? "-" : row.gstintype}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </>
                )}
                <br></br>

                {missingRequiredRows.length > 0 && (
                    <>
                        <Typography 
                            variant="h6" 
                            sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: "10px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Missing Required Fields Cannot Be Processed for Upload
                            <ErrorOutlineIcon sx={{ color: 'red', fontSize: '18px', marginLeft: '5px' }} />
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    {allColumns.map((col, index) => {
                                        const isGSTINRequired = 
                                            col === "GSTIN" && 
                                            missingRequiredRows.some(row => row["GSTIN Type"] && !row["GSTIN"]);

                                        return (
                                            <TableCell 
                                                key={index} 
                                                sx={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}
                                            >
                                                {col} 
                                                {(requiredFields.includes(col) || isGSTINRequired) && (
                                                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                                <TableBody>
                                    {missingRequiredRows.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {allColumns.map((col, colIndex) => (
                                                <TableCell key={colIndex} sx={{ fontSize: '14px' }}>
                                                    {row[col] || "-"}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
                <br></br>

                {pincodeInvalidRows.length > 0 && (
                    <>
                        <Typography 
                            variant="h6" 
                            sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: "10px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Enter a valid 6-digit pincode
                            <ErrorOutlineIcon sx={{ color: 'red', fontSize: '18px', marginLeft: '5px' }} />
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    {allColumns.map((col, index) => {
                                        return (
                                            <TableCell 
                                                key={index} 
                                                sx={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}
                                            >
                                                {col}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                                <TableBody>
                                    {pincodeInvalidRows.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {allColumns.map((col, colIndex) => (
                                                <TableCell key={colIndex} sx={{ fontSize: '14px' }}>
                                                    {row[col]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
                <br></br>

                {unmatchedSalesmenList.length > 0 && (
                    <>
                        <Typography 
                            variant="h6" 
                            sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: "10px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Unassociated Salesman ID Cannot Be Processed for Upload
                            <ErrorOutlineIcon sx={{ color: 'red', fontSize: '18px', marginLeft: '5px' }} />
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        {allColumns.map((col, index) => (
                                            <TableCell 
                                                key={index} 
                                                sx={{
                                                    fontSize: '16px', 
                                                    fontWeight: 'bold', 
                                                    textAlign: 'center',
                                                    backgroundColor: col === "Salesman ID" ? '#FFCCCC' : 'inherit'  
                                                }}
                                            >
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {unmatchedSalesmenList.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {allColumns.map((col, colIndex) => (
                                                <TableCell key={colIndex} sx={{ fontSize: '14px' }}>
                                                    {row[col] || "-"}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {missingGSTINTypeRows.length === 0 && invalidGSTINTypeRows.length === 0 && missingRequiredRows.length === 0 && (
                    <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                        <br></br>
                        All necessary GST and field details are present
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", paddingBottom: "20px" }}>
                {filteredValidRows.length === 0 && (
                    <Typography variant="body2" color="error" sx={{ marginLeft: "10px" }}>
                    No valid records available.
                 </Typography>
                    
                )}
                <Box sx={{ width: "10px" }}/>
                    <Button 
                    onClick={handleCloseDialog} 
                    variant="contained" 
                    color="error" 
                    sx={{ fontSize: '12px', padding: '8px 20px' }}
                >
                    Close
                </Button>

                {filteredValidRows.length > 0 && (
                    <Button 
                        onClick={handleUploadValidRows} 
                        variant="contained" 
                        color="primary" 
                        sx={{ fontSize: '12px', padding: '8px 20px', marginLeft: "10px" }}
                    >
                        Proceed with Uploading Valid Records
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default GSTINDialog;