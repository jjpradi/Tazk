import GstItcBlockReasonService from '../../services/gstItcBlockReason_services';
import {
    GST_ITC_BLOCK_REASON_LIST,
    GST_ITC_BLOCK_REASON_ADD,
    GST_ITC_BLOCK_REASON_UPDATE,
    GST_ITC_BLOCK_REASON_DELETE,
} from '../actionTypes';
import { ErrorAlert } from './load';

// Unwrap { status, data } envelope from the accounts service.
const unwrap = (res) => {
    const body = res && res.data;
    if (body && typeof body === 'object' && 'data' in body) return body.data;
    return body;
};

// List all live reasons for the current company.
export const gstItcBlockReasonListAction = (callback) => async (dispatch) => {
    try {
        const res = await GstItcBlockReasonService.list();
        if (res.status === 200) {
            const payload = unwrap(res) || [];
            dispatch({ type: GST_ITC_BLOCK_REASON_LIST, payload });
            if (callback) callback(payload);
        }
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject('API_FINISHED_ERROR');
    }
};

// Create a user-defined reason. Backend restricts to Administrator.
export const gstItcBlockReasonAddAction = (data, callback) => async (dispatch) => {
    try {
        const res = await GstItcBlockReasonService.create(data);
        if (res.status === 200 || res.status === 201) {
            dispatch({ type: GST_ITC_BLOCK_REASON_ADD, payload: unwrap(res) });
if (callback) callback(unwrap(res));
            // Refresh list so the new row shows up
            dispatch(gstItcBlockReasonListAction());
        }
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject('API_FINISHED_ERROR');
    }
};

// Update reason_label / sort_order (and reason_code for user rows).
export const gstItcBlockReasonUpdateAction = (id, data, callback) => async (dispatch) => {
    try {
        const res = await GstItcBlockReasonService.update(id, data);
        if (res.status === 200) {
            dispatch({ type: GST_ITC_BLOCK_REASON_UPDATE, payload: unwrap(res) });
if (callback) callback(unwrap(res));
            dispatch(gstItcBlockReasonListAction());
        }
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject('API_FINISHED_ERROR');
    }
};

// Soft-delete a user-defined reason. System rows are protected server-side.
export const gstItcBlockReasonDeleteAction = (id, callback) => async (dispatch) => {
    try {
        const res = await GstItcBlockReasonService.remove(id);
        if (res.status === 200) {
            dispatch({ type: GST_ITC_BLOCK_REASON_DELETE, payload: { id } });
if (callback) callback();
            dispatch(gstItcBlockReasonListAction());
        }
        return Promise.resolve(res.data);
    } catch (err) {
        ErrorAlert(dispatch, err);
        return Promise.reject('API_FINISHED_ERROR');
    }
};
