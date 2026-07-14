import { CREATE_FORM_12BB, LIST_FORM_12BB } from "redux/actionTypes";

import { CreateAlert, ErrorAlert } from "./load";
import incometax_services from "services/incometax_services";
import { OpenalertActions } from "./alert_actions";


export const CreateForm12 = (data) => async (dispatch) => {
    try {
        const res = await incometax_services.createform12(data)
        console.log(res.data,res,'bbb');

        if(res.status === 200) {
            dispatch({
                type : CREATE_FORM_12BB,
                payload : res.data
            })
            if(res.data === "already created"){
               OpenalertActions({msg: "Already created on this person", severity: 'success'})
            }else{
                CreateAlert(dispatch);
            }
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

export const ListForm12BB = () => async (dispatch) => {
    try {
        const res = await incometax_services.getAll()
        
        if(res.status === 200) {
            dispatch({
                type : LIST_FORM_12BB,
                payload : res.data
            })
        }
        return Promise.resolve("API_FINISHED_SUCCESS")
    }
    catch(err) {
        ErrorAlert(dispatch, err)
        return Promise.resolve("API_FINISHED_ERROR")
    }
}

