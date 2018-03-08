import React, { Component } from 'react';
import isEmpty from 'ramda/isEmpty'
import './App.css';

class App extends Component {
  componentDidMount() {
    const isDebugMode = process.env.NODE_ENV === 'dev';
    if (isDebugMode && !window.ZKWJSBridge) {
      require('./utils/ZKWJSBridge');
    }

    document.addEventListener('ZKWJSBridgeReady', () => {
      if (isDebugMode) {
        console.log('---Bridge ready---');
      }

      window.ZKWJSBridge.invoke('pageInit', {}, (res) => {
        window.jsHooks.init(res);
      })
    })
  }


  render() {
    const { data } = this.props;
    if (isEmpty(data)) {
      return <div id="loading-mask" />;
    }
    return (
      <div className="App">
        hybrid
      </div>
    );
  }
}

export default App;
