import React, { Component } from 'react';
// import isEmpty from 'lodash/isEmpty'
import QuillEditor from './quillEditor/QuillEditor';
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
    // data应该是从 App 获取数据的
    // const { data } = this.props;
    // if (isEmpty(data)) {
    //   return <div id="loading-mask" />;
    // }
    return (
      <div className="App">
        <QuillEditor />
      </div>
    );
  }
}

export default App;
