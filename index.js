var bitcore     = require('bitcore')
// var Handlebars  = require('handlebars')
var get         = require("get-next")
var post        = require("simple-post-json")
var rivets      = require("rivets")


// test command
//
// var b = Bitcoin.init(); b.send(0.00001, "197GxXSqqSAkhLXyy9XrtEySvssuDcQGMY")


// Blockchain API class
//   (the only external api used)
//
// - unspent (gets the list of the unspent outputs, utxo)
// - balance (gets the address balance)
//
var BchainApi = {

  // utxos

  unspent: function(address, handler) {
    this._getUnspentJson(
      address,
      handler
    )
  },

  _unspentUrl: function(address) {
    return "/unspent?active="+address+"&format=json&cors=true"
  },

  _getUnspentJson: function(address, handler) {
    get(this._unspentOpts(address)).next(function (data, res) {
      handler(JSON.parse(data));
    }.bind(this));
  },

  _unspentOpts: function(address) { // TODO: refactor all Opts with merge/extend
    return {
      host: this._blockchainHost(),
      path: this._unspentUrl(address),
      type: "all",
      port: 443,
      withCredentials: false
    }
  },


  // balance

  balance: function(address, handler) {
    this._getBalanceJson(
      address,
      handler
    )
  },

  _getBalanceJson: function(address, handler) {
    get(this._balanceOpts(address)).next(function (data, res) {
      data = JSON.parse(data)
      handler(data);
    }.bind(this));
  },

  _balanceOpts: function(address) {
    return {
      host: this._blockchainHost(),
      path: this._balanceUrl(address),
      type: "all",
      port: 443,
      withCredentials: false
    }
  },

  _balanceUrl: function(address) {
    // return "/address/"+address+"?format=json"
    return "/q/addressbalance/"+address+"?format=json"
  },


  // push tx

  pushTx: function(tx_hash, handler) {
    this._postTxJson(
      tx_hash,
      handler
    )
  },

  _postTxJson: function(tx_hash, handle) {
    var consl = console
    postJSON(
      this._pushTxUrl(),
      { tx: tx_hash },
      function(data){   //callback
        handle(data);
      }, function(err){ //errback
        consl.err(err)
    })
  },

  _pushTxUrl: function(address) {
    // return "/address/"+address+"?format=json"
    return "/pushtx?format=json"
  },

  // https://blockchain.info/pushtx
  // { tx: "{}" }


  // common

  _blockchainHost: function() {
    return "blockchain.info"
  }

  // TODO commonOpts
}

// BchainApi.unspent("197GxXSqqSAkhLXyy9XrtEySvssuDcQGMY", function(result){
//  console.log(result) // => Object { unspent_outputs: Array[1] }
// })
window.BchainApi = BchainApi // temp


// Bitcoin
//   bitcoin wallet
//
// - based on bitcore
// - localstorage (saves keys locally in the browser)
// - reveal private key
// - one-to-many transaction TODO one input, many outputs
//

// TODO import bitcoin private key

var Bitcoin = {

  init: function() {
    this._loadFromBackup()
    if ( !this.privateKey ) {
      this._generateKeyPair()
      // optional
      this._saveToBackup()
    }
    return this
  },

  privateKey: function() {
    return this.privateKey;
  },

  address: function() {
    return this.address;
  },

  // sends [amount] to each address
  send: function(amount, addresses) {
    var transaction = this._buildTransaction(amount, addresses)
    return this._broadcastTransaction(transaction)
  },


  // -- private

  // backup

  _loadFromBackup: function() {
    // TODO: naive way, writes the private key in clear, hash it with a password, use bip38?
    if (this._backupStorage) {
      this.privateKey = localStorage.swb_privateKey
      this.address    = localStorage.swb_address
    }
  },

  _saveToBackup: function() {
    var storage = localStorage
    storage.swb_privateKey = this.privateKey
    storage.swb_address    = this.address
  },

  _backupStorage: function() {
    return localStorage.swb_
  },

  // keypair

  _generateKeyPair: function() {
    this.privateKey = new bitcore.PrivateKey()
    this.address    = this.privateKey.publicKey.toAddress()
  },

  // query for unspent outputs
  _unspentOutputs: function() {
    return BchainApi.unspent(address);
  },

  _signTransaction: function() {

  },

  _broadcastTransaction: function(transaction) {
    transaction // ...
  },

  _buildTransaction: function(amount, addresses) {
    // TODO: right now sends [amount] only to the first address

    var minimum_non_dust_amount = 5430 // .fee(minimum_non_dust_amount)

    var address = addresses[0]


    BchainApi.unspent(this.address, function(result){
      // console.log("unspent", result) // => Object { unspent_outputs: Array[1] }

      var address = "19e2eU15xKbM9pyDwjFsBJFaSeKoDxp8YT"
      var unspent_output = result.unspent_outputs[0] // temp
      console.log("unspent_output", unspent_output)


      var new_input = {
        txid:         unspent_output.tx_hash,
        outputIndex:  unspent_output.tx_index,
        scriptPubKey: unspent_output.script,
        amount:       unspent_output.value
      }

      // TODO: unspent_outputs
      var transaction = this._bitcoreBuildTx(address, amount, new_input)
      console.log("TX --- ", transaction)



      // var transaction = new bitcore.Transaction()
      // .from({"address":"17SEdNskTNiDxEbkRj87g6jacicKEw7Jot","txid":"197d0dc379356343f0e77713e8d41372b1db451b265cd916fed5662464562d22","vout":0,"scriptPubKey":"76a91446968776ae88c81c5a2459f51e1f0d05b1c02d4388ac","amount":0.003})
      // .to('19e2eU15xKbM9pyDwjFsBJFaSeKoDxp8YT', 10000)
      // .change("17SEdNskTNiDxEbkRj87g6jacicKEw7Jot")
      // .sign('PVT_KEY')

      // .serialize()

      // send ->>>>

      // https://blockchain.info/pushtx
      // { tx: "{}" }


    }.bind(this))


  },

  _bitcoreBuildTx: function(address, amount, unspent_output) {
      console.log("AMOUNT", amount)

        return new bitcore.Transaction()
          .from([unspent_output])          // Feed information about what unspent outputs one can use
          .to(address, amount)  // Add an output with the given amount of satoshis
          .change(this.address)      // Sets up a change address where the rest of the funds will go
          .sign(this.privateKey)     // Signs all the inputs it can
          // .from({
          //   "address": address,
          //   "txid":    "695918d85f25c29ecd3d403b02eef398eda136c5136958041c2e18b0d27dce83",
          //   "vout":0,
          //   "scriptPubKey":"76a91402efd4b4f35379ca41188b624f63449c5d26b7bf88ac",
          //   "amount": amount
          // })



  }


}

window.Bitcoin = Bitcoin


var mainWallet = Bitcoin.init()

// var bitcoin = Bitcoin.init()


// bitcoin.send


// models (defaults)
var models = {
  key: {
    pvtHidden: true
  }
}


// store - object state storage
var store  = {
  keys: []
}

// bitcore actions - add keypair to store
var bitcoreActions = {
  addKey: function() {
    var key = models.key
    key.id = store.keys.length
    key = $.extend(this._generateKey(), key)
    key.balance = "loading..."
    store.keys.push(key)
  },

  _generateKey: function() {
    var privateKey  = mainWallet.privateKey
    var address     = mainWallet.address

    // api getBalance
    BchainApi.balance(address, function(result){
      console.log(result) // => Object { unspent_outputs: Array[1] }
      store.keys[0].balance = result
    }.bind(this))

    // var privateKey  = new bitcore.PrivateKey()
    // var address     = privateKey.publicKey.toAddress()
    return { privateKey: privateKey, address: address }
  }
}


// seed data
bitcoreActions.addKey()
// bitcoreActions.addKey()

// view bind
rivets.bind($('.entries'), store.keys[0])


$("#app").on("click", ".reveal-pvt-key", function(evt){
  store.keys[0].pvtHidden = false
})



// TODO:
//
// - make transaction from utxo and propagate trough blockchain api
//
