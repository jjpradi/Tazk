import timeline_services from 'services/timeline_services'
import { LIST_TIMELINE } from 'redux/actionTypes'
import { ErrorAlert } from './load'

export const ListTimeline = (menuType, id) => async (dispatch) => {
    try {
        const res = await timeline_services.getTimeline(menuType, id)

        if (res.status === 200) {
            dispatch({
                type: LIST_TIMELINE,
                payload: res.data,
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    } catch (err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}
