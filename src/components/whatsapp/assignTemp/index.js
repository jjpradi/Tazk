import {
  Autocomplete,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Fonts} from '../../../shared/constants/AppEnums';
import * as Yup from 'yup';
import {FormikProvider, useFormik, Form} from 'formik';
import {useNavigate, useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import Context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {sendMsgAction} from '../../../redux/actions/whatsappAction';
import * as XLSX from 'xlsx-js-style';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const AssignTemp = ({handleClose,id}) => {
  //const {id} = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const {
    WhatsappReducers: {tempList, customer},
  } = useSelector((s) => s);

  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(Context);

  const [tempData, setTempData] = useState({});
  const [headerVariable, setHeaderVariable] = useState([]);
  const [bodyVariables, setBodyVariables] = useState([]);
  const [buttonsVariables, setButtonsVariables] = useState([]);
  const [payloads, setPayloads] = useState([]);

  useEffect(() => {
    const temp = tempList.find((f) => f.id === id);
    setTempData(temp);
  }, [id, tempList]);

  const template_header = tempData?.header || '';
  const template_body = tempData?.body || '';

  const placeholderRegex = /\{\{(\d+)\}\}/g;
  const headerField = [...template_header.matchAll(placeholderRegex)].map(
    (match) => parseInt(match[1], 10),
  );
  const bodyField = [...template_body.matchAll(placeholderRegex)].map((match) =>
    parseInt(match[1], 10),
  );

  useEffect(() => {
    setHeaderVariable(Array(headerField.length).fill(''));
    setBodyVariables(Array(bodyField.length).fill(''));
  }, [bodyField.length, headerField.length]);

  const handleHeaderVariable = (index) => (event) => {
    const newValues = [...headerVariable];
    newValues[index] = event.target.value;
    setHeaderVariable(newValues);
  };

  const handleBodyVariables = (index) => (event) => {
    const newValues = [...bodyVariables];
    newValues[index] = event.target.value;
    setBodyVariables(newValues);
  };

  const getFinalHeaderMessage = () => {
    let finalMessage = template_header;
    headerField.forEach((placeholder, index) => {
      finalMessage = finalMessage.replace(
        `{{${placeholder}}}`,
        headerVariable[index] || `{{${placeholder}}}`,
      );
    });
    return finalMessage;
  };

  const getFinalBodyMessage = () => {
    let finalMessage = template_body;
    bodyField.forEach((placeholder, index) => {
      finalMessage = finalMessage.replace(
        `{{${placeholder}}}`,
        bodyVariables[index] || `{{${placeholder}}}`,
      );
    });
    return finalMessage;
  };

  const jsonString =
    '[{"type": "QUICK_REPLY", "text": "VIEW PRODUCTS"}, {"type": "QUICK_REPLY", "text": "Stop"}]';
  const jsonData = JSON.parse(jsonString);

  const urlItem = jsonData?.find((item) => item.type === 'URL');

  const placeholders1 = urlItem
    ? Array.from(
        new Set(
          urlItem.url
            .match(placeholderRegex)
            ?.map((ph) => ph.match(/\d+/)[0]) || [],
        ),
      )
    : [];

  useEffect(() => {
    setButtonsVariables(Array(placeholders1.length).fill(''));
  }, [placeholders1.length]);

  const handleButtons = (index) => (event) => {
    const newValues = [...buttonsVariables];
    newValues[index] = event.target.value;
    setButtonsVariables(newValues);
  };

  const getUpdatedJsonString = () => {
    if (!urlItem) return '';

    let updatedUrl = urlItem.url;
    placeholders1.forEach((placeholder, index) => {
      const regex = new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g');
      updatedUrl = updatedUrl.replace(
        regex,
        buttonsVariables[index] || `{{${placeholder}}}`,
      );
    });

    return updatedUrl;
  };

  const getButtonValues = () => {
    const buttonValues = {};
    placeholders1.forEach((placeholder, index) => {
      buttonValues[placeholder] = [
        buttonsVariables[index] || `{{${placeholder}}}`,
      ];
    });
    return buttonValues;
  };

  const updatedJson = getUpdatedJsonString();
  const buttonValues = getButtonValues();

  function checkForButtons(obj) {
    for (let key in obj) {
      if (Object.hasOwn(obj, key)) {
        const containsPlaceholders = obj[key].some((element) =>
          /\{\{.*?\}\}/.test(element),
        );

        if (containsPlaceholders) {
          return [];
        }
      }
    }
    return obj;
  }

  const initialValues = {
    select_customer: [],
  };

  const validationSchema = Yup.object({
    select_customer: Yup.array()
      .min(1, 'At least one customer must be selected')
      .required('Select Customer!'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: () => {
      let values = {...formik.values};

      let payload = {payloads};

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(sendMsgAction(payload)),
      );
    },
  });

  // const handleClose = () => {
  //   navigate(`/smsmailconfiguration`);
  // };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    touched,
    setFieldValue,
    handleSubmit,
    getFieldProps,
  } = formik;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const customers = await json.map((row) => ({
        customer_name: row.name,
        phone_number: row.phoneNumber,
      }));

      let newPayloads = await createPayloads(customers);
      await setPayloads(newPayloads);
      setFieldValue('select_customer', customers);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleCustomer = async (value) => {
    console.log('value', value);
    let newPayloads = await createPayloads(value);
    await setPayloads(newPayloads);

    setFieldValue('select_customer', value);
  };

  console.log('payloads',id, payloads);

  const createPayloads = (customers) => {
    console.log('customers', customers);
    return customers.map((c) => {
      return {
        countryCode: '+91',
        phoneNumber: c.phone_number,
        callbackData: 'some text here',
        type: 'Template',
        template: {
          name: tempData.name,
          languageCode: 'en',
          // header: tempData.header,
          header_format: tempData.header_format,
          // footer: tempData.footer,
          headerValues: headerVariable.every((element) => element === '')
            ? []
            : headerVariable.map((item) =>
                item === 'SET_CUSTOMER_NAME' ? c.customer_name : item,
              ),
          bodyValues: bodyVariables.every((element) => element === '')
            ? []
            : bodyVariables.map((item) =>
                item === 'SET_CUSTOMER_NAME' ? c.customer_name : item,
              ),
        },
      };
    });
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete='off' noValidate onSubmit={handleSubmit}>
        <Grid
          container
          display='flex'
          flexDirection='row'
          alignItems='center'
          spacing={5}
        >
          <Grid size={12}>
            <Typography
              sx={{
                color: 'text.primary',
                fontWeight: Fonts.SEMI_BOLD,
                fontSize: 16,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Send Message
            </Typography>
          </Grid>

          <Grid size={4}>
            <Autocomplete
              multiple
              limitTags={1}
              options={customer}
              disableCloseOnSelect
              getOptionLabel={(option) => option.customer_name}
              onChange={async (event, value) => handleCustomer(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Select Customer'
                  name='select_customer'
                  required
                  fullWidth
                  error={
                    touched.select_customer && Boolean(errors.select_customer)
                  }
                  helperText={touched.select_customer && errors.select_customer}
                />
              )}
            />
          </Grid>

          <Grid size={3}>
            <input
              type='file'
              accept='.xlsx, .xls'
              ref={fileInputRef}
              style={{display: 'none'}}
              onChange={handleFileUpload}
            />
            <Button
              fullWidth
              variant='outlined'
              startIcon={<FileUploadIcon />}
              onClick={handleClick}
            >
              Upload Excel
            </Button>
          </Grid>

          <Grid size={12}>
            {headerField.map((placeholder, index) => (
              <Box
                key={index}
                display='flex'
                flexDirection={{xs: 'column', sm: 'row'}}
                alignItems='center'
                gap={2}
              >
                <Typography variant='h6'>Header</Typography>
                <TextField
                  placeholder={`Value for placeholder ${placeholder}`}
                  value={headerVariable[index]}
                  onChange={handleHeaderVariable(index)}
                  fullWidth
                  margin='normal'
                />

                <Button
                  size='small'
                  variant='outlined'
                  onClick={() => {
                    const newValues = [...headerVariable];
                    newValues[index] = 'SET_CUSTOMER_NAME';
                    setHeaderVariable(newValues);
                  }}
                >
                  Customer Name
                </Button>
              </Box>
            ))}
            <Typography variant='h6'>{getFinalHeaderMessage()}</Typography>
          </Grid>

          <Grid size={12}>
            <Typography variant='h6'>Body</Typography>
            {bodyField.map((placeholder, index) => (
              <Box
                key={index}
                display='flex'
                flexDirection={{xs: 'column', sm: 'row'}}
                alignItems='center'
                gap={2}
              >
                <TextField
                  placeholder={`Value for placeholder ${placeholder}`}
                  value={bodyVariables[index]}
                  onChange={handleBodyVariables(index)}
                  fullWidth
                  margin='normal'
                />

                <Button
                  size='small'
                  variant='outlined'
                  onClick={() => {
                    const newValues = [...bodyVariables];
                    newValues[index] = 'SET_CUSTOMER_NAME';
                    setBodyVariables(newValues);
                  }}
                >
                  Customer Name
                </Button>
              </Box>
            ))}
            <Typography variant='h6'>{getFinalBodyMessage()}</Typography>
          </Grid>

          <Grid size={12}>
            <Box>
              {placeholders1.map((placeholder, index) => (
                <TextField
                  key={index}
                  label={`Value for placeholder ${placeholder}`}
                  value={buttonsVariables[index]}
                  onChange={handleButtons(index)}
                  fullWidth
                  margin='normal'
                />
              ))}

              <Typography variant='h6'>Updated URL:</Typography>
              <pre>{updatedJson}</pre>
              {/* <Typography variant='h6'>Button Values:</Typography>
              <pre>{JSON.stringify(buttonValues, null, 2)}</pre> */}
            </Box>
          </Grid>

          <Grid display='flex' justifyContent='flex-end' size={12}>
            <Box display='flex' flexDirection='row' gap={2}>
              <Button variant='contained' color='inherit' onClick={handleClose}>
                {'Cancel'}
              </Button>
              <Button type='submit' variant='contained' onClick={handleSubmit}>
                {'Submit'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
};

export default AssignTemp;
