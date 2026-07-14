import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  TextField,
  Button,
  DialogActions,
  DialogContent,
  Typography,
  Grid,
} from '@mui/material';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { sendQuotationMailAction } from 'redux/actions/quotation_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from '../utils/customFetchApiUrls';

const ProposalMail = ({ handleMailClose, setModalTypeHandler, setLoaderStatusHandler }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    attachments: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const quillRef = useRef(null);
  const customFetch = useCustomFetch();

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: value.trim() ? '' : prev[name],
    }));
  };

  const handleQuillChange = (value) => {
    const sanitizedHTML = DOMPurify.sanitize(value);
    setFormData((prev) => {
      if (prev.content !== value) {
        return { ...prev, content: value };
      }
      return prev;
    });

    setFormErrors((prev) => ({
      ...prev,
      content: value.trim() ? '' : prev.content,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        attachments: {
          filename: file.name,
          contentType: file.type,
          path: URL.createObjectURL(file), 
        },
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = ['to', 'subject', 'content'];
    const errors = {};

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${capitalize(field)} is required`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const sanitized = DOMPurify.sanitize(formData.content);
    try {
      const payload = {
        to: formData.to.split(',').map((email) => email.trim()), 
        cc: formData.cc ? formData.cc.split(',').map((email) => email.trim()) : [],
        bcc: formData.bcc ? formData.bcc.split(',').map((email) => email.trim()) : [],
        subject: formData.subject,
        content: sanitized,
        attachments: formData.attachments || {},
        type: 'create'
      };

      const response = await dispatch(
        sendQuotationMailAction(payload, setModalTypeHandler, setLoaderStatusHandler)
      );
        
      const response2 = await customFetch(API_URLS.CREATE_QUOTATION_PROPOSAL, 'POST', payload);
      const result = Array.isArray(response2?.data) ? response2.data : [];
      if (response?.data?.msg !== 'Setup Mail Configuration') {
        handleMailClose(result);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Send Mail
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="To"
          name="to"
          value={formData.to}
          onChange={handleChange}
          error={!!formErrors.to}
          helperText={formErrors.to}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="CC"
          name="cc"
          value={formData.cc}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="BCC"
          name="bcc"
          value={formData.bcc}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          error={!!formErrors.subject}
          helperText={formErrors.subject}
          required
        />
        <Grid container>
          <Grid size={12}>
            <ReactQuill
              ref={quillRef} 
              theme="snow"
              placeholder="Write something..."
              value={formData.content}
              onChange={handleQuillChange}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  ['link', 'image', 'video', 'formula'],
                  [{ header: 1 }, { header: 2 }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ script: 'sub' }, { script: 'super' }],
                  [{ indent: '-1' }, { indent: '+1' }],
                  [{ size: ['small', false, 'large', 'huge'] }],
                  [{ color: [] }, { background: [] }],
                  [{ font: [] }],
                  [{ align: [] }],
                  ['clean'],
                ],
              }}
            />
            {formErrors.content && (
              <Typography color="error" variant="body2">
                {formErrors.content}
              </Typography>
            )}
          </Grid>
        </Grid>
        <input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf, image/*"
          style={{ marginTop: '10px' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleMailClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSend} variant="contained" color="primary">
          Send
        </Button>
      </DialogActions>
    </>
  );
};

export default ProposalMail;
