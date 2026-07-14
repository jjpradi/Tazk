import React, {useState, useEffect, useRef} from 'react';
import {} from 'react-router-dom';

const UnSavedChangesWarning = (
  message = 'Are You sure you want to discard changes?',
) => {
  const [dirty, setDirty] = useState(false);
  const tempset = useRef(null);
  const set = () => {
    window.onbeforeunload = dirty && (() => message);
    return () => {
      window.onbeforeunload = null;
    };
  };
  tempset.current = set;
  useEffect(() => {
    tempset.current();
  }, [dirty]);

  const Prompt = () => {
    // usePrompt(message, dirty);
    return <></>
  };

  const routerPrompt = <Prompt when={dirty} message={message} />;

  return [routerPrompt, () => setDirty(true), () => setDirty(false)];
};

export default UnSavedChangesWarning;
