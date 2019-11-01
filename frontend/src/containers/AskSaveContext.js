import React, { useState } from 'react';
import { history } from '../helpers/misc';

const AskSaveContext = ({ Child, child_props }) => {
  const [save_dialog, setSave_dialog] = useState('none');  

  useEffect(() => {
    return history.block(() => {
      switch (save_dialog) {
        case 'none':
          setSave_dialog('ask');
          return false;
        case 'ask':
          setSave_dialog('none');
          return false;
        case 'save':
          return true;
        case 'discard':
          return true;
        }
    });
  }, [save_dialog, setSave_dialog]);

  return (
    <Child { ...child_props, save_dialog, setSave_dialog } />
  );
};

export default AskSaveContext;
