import SplitPane, {
  Divider,
  SplitPaneBottom,
  SplitPaneLeft,
  SplitPaneRight,
  SplitPaneTop,
} from './SplitPane';
import React from 'react';
import QuoteContext from './QuoteContext';
import Header from '../../../components/pos/Header';

import './index.css';

//   const quotes = [];

function Template() {
  // const [currQuote, setCurrQuote] = useState(1);

  return (
    <div className='App'>
      <Header style={{background: 'grey'}} />
      <QuoteContext.Provider value={{}}>
        <SplitPane className='split-pane-row'>
          <SplitPaneLeft>
            <SplitPane className='split-pane-col'>
              <SplitPaneTop />
              <Divider className='separator-row' />
              <SplitPaneBottom />
            </SplitPane>
          </SplitPaneLeft>
          <Divider className='separator-col' />

          <SplitPaneRight />
        </SplitPane>
      </QuoteContext.Provider>
    </div>
  );
}

export default Template;
