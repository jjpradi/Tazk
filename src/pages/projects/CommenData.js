import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import BugReportIcon from '@mui/icons-material/BugReport';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';


export const IssueTypeIcon = ({ type }) => {
    const normalizedType = String(type || '').toLowerCase() .split(' ').join(''); // ✅ normalize input

    const baseSx = { mr: 1, fontSize: 18 }; // ✅ move here

    switch (normalizedType) {
        case 'epic':
        case '2':
            return (
                <LocalFireDepartmentOutlinedIcon
                    sx={{ ...baseSx, color: '#FF5722' }}
                />
            );

        case 'story':
        case '3':
            return (
                <AutoStoriesOutlinedIcon
                    sx={{ ...baseSx, color: '#4CAF50' }}
                />
            );

        case 'task':
        case '1':
            return (
                <PlaylistAddCheckOutlinedIcon
                    sx={{ ...baseSx, color: '#2196F3' }}
                />
            );

        case 'bug':
        case '4':
            return (
                <BugReportIcon sx={{ ...baseSx, color: '#e60909' }}
                />
            );

        case 'subtask':
        case '5':
            return (
                <SubdirectoryArrowRightIcon sx={{ ...baseSx, color: '#2196F3' }}
                />
            );

        default:
            return (
                <PlaylistAddCheckOutlinedIcon
                    sx={{ ...baseSx, color: '#2196F3' }}
                />
            );
    }
};