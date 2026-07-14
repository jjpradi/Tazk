import {alpha,Tooltip} from '@mui/material';

export default function CommonToolTip({children, ...props}){
    return <Tooltip {...props}  >{children}</Tooltip>
};