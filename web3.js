const Web3 = require("web3")

const BSC_RPC = 'https://bsc-a29k3di6gz293snk.ezdefi.com/'

let options = {
  timeout: 30000, // ms

  // Useful for credentialed urls, e.g: ws://username:password@localhost:8546
  headers: {
    authorization: 'Basic username:password'
  },

  clientConfig: {
    // Useful if requests are large
    maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
    maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 60000 // ms
  },

  // Enable auto reconnection
  reconnect: {
      auto: true,
      delay: 30000, // ms
      onTimeout: false
  }
}
exports.web3 = new Web3( new Web3.providers.HttpProvider(BSC_RPC))
