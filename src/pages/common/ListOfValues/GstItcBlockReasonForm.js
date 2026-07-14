import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Container, Grid, TextField, Typography } from '@mui/material';
import { gstItcBlockReasonAddAction } from 'redux/actions/gstItcBlockReason.actions';

// reason_code must be lowercase letters / digits / underscores, 3-64 chars,
// alpha at start & end. Mirrors the server-side CODE_REGEX.
const CODE_REGEX = /^[a-z][a-z0-9_]{1,62}[a-z0-9]$/;

const GstItcBlockReasonForm = (props) => {
    const dispatch = useDispatch();

    const [values, setValues] = useState({
        reason_code: '',
        reason_label: '',
        sort_order: 100,
    });
    const [errors, setErrors] = useState({});

    const handleChange = (val, name) => {
        setValues({ ...values, [name]: val });
        setErrors({ ...errors, [name]: null });
    };

    const validate = () => {
        const err = {};
        if (!values.reason_code || !CODE_REGEX.test(values.reason_code.trim().toLowerCase())) {
            err.reason_code = 'Use lowercase letters / digits / underscores (3–64 chars, alpha start & end)';
        }
        if (!values.reason_label || !values.reason_label.trim()) {
            err.reason_label = 'Label is required';
        }
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const payload = {
            reason_code: values.reason_code.trim().toLowerCase(),
            reason_label: values.reason_label.trim(),
            sort_order: Number(values.sort_order) || 100,
        };
        await dispatch(gstItcBlockReasonAddAction(payload, () => {
            props.handleClose();
        }));
    };

    return (
        <Container sx={{ p: 5 }}>
            <Grid container spacing={3}>
                <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                    <Typography variant="h6" align="left">Add ITC Block Reason</Typography>
                </Grid>
                <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                    <TextField
                        required
                        fullWidth
                        label="Code (machine-readable)"
                        placeholder="e.g. personal_use_partial"
                        variant="filled"
                        value={values.reason_code}
                        onChange={(e) => handleChange(e.target.value, 'reason_code')}
                        error={!!errors.reason_code}
                        helperText={errors.reason_code || 'Lowercase, underscores, no spaces. Used by reports.'}
                    />
                </Grid>
                <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                    <TextField
                        required
                        fullWidth
                        label="Label (shown in dropdown)"
                        variant="filled"
                        value={values.reason_label}
                        onChange={(e) => handleChange(e.target.value, 'reason_label')}
                        error={!!errors.reason_label}
                        helperText={errors.reason_label || ''}
                    />
                </Grid>
                <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Sort order"
                        variant="filled"
                        value={values.sort_order}
                        onChange={(e) => handleChange(e.target.value, 'sort_order')}
                        helperText="Lower numbers appear first. System reasons use 10–70."
                    />
                </Grid>
                <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                    <Grid container gap={2} display="flex" justifyContent="end">
                        <Grid>
                            <Button variant="contained" onClick={() => props.handleClose()}>Cancel</Button>
                        </Grid>
                        <Grid>
                            <Button variant="contained" onClick={handleSubmit}>Add</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default GstItcBlockReasonForm;
