import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import IntlMessages from '@crema/utility/IntlMessages';
import PropTypes from 'prop-types';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import Box from '@mui/material/Box';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='down' ref={ref} {...props} />;
});

const AddNewBoard = ({
  isAddBoardOpen,
  onCloseAddBoardModal,
  onAddBoard,
  selectedBoard,
  existingBoards,
}) => {
  const [boardName, setBoardName] = useState(() =>
    selectedBoard ? selectedBoard.name : '',
  );
  const [error, setError] = useState('');
  const MIN_LEN = 2;
  const MAX_LEN = 60;
  const onClickAddButton = () => {
    const trimmed = boardName.trim();
    if (!trimmed) {
      setError('scrumboard.boardTitle.required');
      return;
    }
    if (trimmed.length < MIN_LEN) {
      setError('scrumboard.boardTitle.tooShort');
      return;
    }
    if (trimmed.length > MAX_LEN) {
      setError('scrumboard.boardTitle.tooLong');
      return;
    }
    const others = (existingBoards || []).filter(
      (b) => !selectedBoard || b?.id !== selectedBoard.id,
    );
    const isDuplicate = others.some(
      (b) => String(b?.name || '').trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      setError('scrumboard.boardTitle.duplicate');
      return;
    }
    onAddBoard(trimmed);
    setBoardName('');
    setError('');
    onCloseAddBoardModal();
  };


  return (
    <Dialog
      open={isAddBoardOpen}
      onClose={() => {
        setError('');
        onCloseAddBoardModal(false);
      }}
      aria-labelledby='simple-modal-title'
      TransitionComponent={Transition}
      aria-describedby='simple-modal-description'
      sx={{
        '& .MuiDialog-paperWidthSm': {
          maxWidth: 600,
          width: '100%',
        },
        '& .MuiTypography-h6': {
          fontWeight: Fonts.LIGHT,
        },
      }}
    >
      <Card
        sx={{
          padding: '32px 40px',
        }}
      >
        <TextField
          fullWidth
          margin='normal'
          label={<IntlMessages id='scrumboard.boardTitle' />}
          value={boardName}
          onChange={(event) => {
            setBoardName(event.target.value);
            if (error) setError('');
          }}
          slotProps={{htmlInput: {maxLength: MAX_LEN}}}
          error={Boolean(error)}
          helperText={error ? <IntlMessages id={error} /> : ''}
        />
        <Box
          sx={{
            mt: 3,
            textAlign: 'right',
          }}
        >
          <Button
            variant='outlined'
            sx={{
              paddingRight: 8,
              paddingLeft: 8,
            }}
            onClick={onClickAddButton}
          >
            <IntlMessages id='common.add' />
          </Button>
        </Box>
      </Card>
    </Dialog>
  );
};

export default AddNewBoard;

AddNewBoard.propTypes = {
  isAddBoardOpen: PropTypes.bool.isRequired,
  onCloseAddBoardModal: PropTypes.func.isRequired,
  onAddBoard: PropTypes.func,
  selectedBoard: PropTypes.node,
  existingBoards: PropTypes.array,
};

AddNewBoard.defaultProps = {
  existingBoards: [],
};
