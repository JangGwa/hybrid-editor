
const methodMap = {};

function register(method, func) {
  methodMap[method] = func;
}

const ZKWJSBridge = {
  invoke(method, ...args) {
    if (methodMap[method]) {
      methodMap[method](...args);
    } else {
      throw new Error(`${method} not support`);
    }
  }
}

register('pageInit', (options, callback) => {
  callback({});
})

window.ZKWJSBridge = ZKWJSBridge;

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    const event = new Event('ZKWJSBridgeReady');
    document.dispatchEvent(event);
  }
}

export default ZKWJSBridge;