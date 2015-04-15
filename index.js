var bitcore     = require('bitcore')
// var Handlebars  = require('handlebars')
var get         = require("get-next")
var post        = require("post-json")
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
    console.log("pushing transaction:", tx_hash)
    var consl = console
    var host  = "localhost:3001" // TODO: prod version needs to go on wallet_cors.mkvd.net
    var url   = 'http://' + host + this._pushTxUrl()

    // var url   = 'https://' + this._blockchainHost() + this._pushTxUrl()
    // { tx: tx_hash },
    // var url = "https://btc.blockr.io/api/v1/tx/push"
    // { hex: tx_hash },
    post(
      url,
      { tx: tx_hash },
      function(err, data){   //callback
        if (err) {
          console.error(err)
        }
        handle(data);
      }
    )
  },

  _pushTxUrl: function(address) {
    // return "/address/"+address+"?format=json"
    return "/pushtx?cors=true" // format=json&
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
    this.privateKey = null
    this.address    = null

    this._loadFromBackup()
    if ( !this.privateKey || !this.privateKey.toString() ) {
      this._generateKeyPair()
      // optional
      this._saveToBackup()
    }
    return this
  },

  address: function() {
    return this.address;
  },

  // sends [amount] to each address
  send: function(amount, addresses) {
    var transaction = this._buildTransaction(amount, addresses)
    return this._broadcastTransaction(transaction) // TODO: callback?
  },


  // -- private

  // backup

  _loadFromBackup: function() {
    // TODO: naive way, writes the private key in clear, hash it with a password, use bip38?
    if (this._backupStorage()) {
      // TODO catch exception
      this.privateKey = new bitcore.PrivateKey(localStorage.swb_privateKey)
      this.address    = localStorage.swb_address
    }
  },

  _saveToBackup: function() {
    localStorage.swb_privateKey = this.privateKey.toString()
    localStorage.swb_address    = this.address
  },

  _backupStorage: function() {
    return localStorage.swb_privateKey
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

      // TODO pay address shown
      var address = "19e2eU15xKbM9pyDwjFsBJFaSeKoDxp8YT"
      var unspent_output = result.unspent_outputs[0] // TODO FIXME temporary!
      console.log("unspent_output", unspent_output)


      var new_input = {
        address:      address,
        txid:         unspent_output.tx_hash,
        scriptPubKey: unspent_output.script,
        amount:       unspent_output.value,
        vout:         unspent_output.tx_output_n,
      }

      // outputIndex:  unspent_output.tx_index,

      //   "address":"17SEdNskTNiDxEbkRj87g6jacicKEw7Jot",
      //   "txid":"197d0dc379356343f0e77713e8d41372b1db451b265cd916fed5662464562d22",
      //   "vout":0,
      //   "scriptPubKey":"76a91446968776ae88c81c5a2459f51e1f0d05b1c02d4388ac",
      //   "amount":0.003
      // })

      // TODO: unspent_outputs
      var transaction = this._bitcoreBuildTx(address, amount, new_input)
      var tx_hash = transaction.serialize()

      BchainApi.pushTx(tx_hash, function(){
        console.log("BIG PUSH!!!!")
        console.log("Transaction pushed to the bitcoin network!")
      })



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


      // var transaction = new bitcore.Transaction()
      // .from({
      //   "address":"17SEdNskTNiDxEbkRj87g6jacicKEw7Jot",
      //   "txid":"197d0dc379356343f0e77713e8d41372b1db451b265cd916fed5662464562d22",
      //   "vout":0,
      //   "scriptPubKey":"76a91446968776ae88c81c5a2459f51e1f0d05b1c02d4388ac",
      //   "amount":0.003
      // })
      // .to('19e2eU15xKbM9pyDwjFsBJFaSeKoDxp8YT', 10000)
      // .change("17SEdNskTNiDxEbkRj87g6jacicKEw7Jot")
      // .sign('PVT_KEY')

        return new bitcore.Transaction()
          .from([unspent_output])          // Feed information about what unspent outputs one can use
          .to(address, amount)  // Add an output with the given amount of satoshis
          .change(this.address)      // Sets up a change address where the rest of the funds will go
          .sign(this.privateKey)     // Signs all the inputs it can
          // .fee(10000)    // maybe
          // .fee(5430)  // minimum

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
  Key: {
    pvtHidden: true,
    regenerateEnabled: false
  }
}


// store - object state storage
var store  = {
  keys: []
}

// bitcore actions - add keypair to store
var bitcoreActions = {
  send: function(amount, addresses)  {
    // TODO move the Transaction signing here - _buildTransaction - _bitcoreBuildTx
    BchainApi.send(amount, addresses)
  },

  addKey: function() {
    var key = models.Key
    key.id = store.keys.length
    key = $.extend(this._generateKey(), key)
    key.balance = "loading..."
    store.keys.push(key)
  },

  _generateKey: function() {
    var privateKey    = mainWallet.privateKey
    var address       = mainWallet.address
    var privateKeyWIF = mainWallet.privateKey.toWIF()


    // api getBalance
    BchainApi.balance(address, function(balance){
      store.keys[0].balance     = balance
      store.keys[0].balance_btc = balance*Math.pow(10, -8)
    }.bind(this))

    // var privateKey  = new bitcore.PrivateKey()
    // var address     = privateKey.publicKey.toAddress()
    return { privateKey: privateKey, address: address, privateKeyWIF: privateKeyWIF }
  }
}


// seed data
bitcoreActions.addKey()
// bitcoreActions.addKey()

// view bind
rivets.bind($('.entries'), store.keys[0])


// action handlers
$("#app").on("click", ".reveal-pvt-key", function(evt){
  store.keys[0].pvtHidden = false
})

$("#app").on("click", ".btn-send", function(evt){
  // TODO <button class="btn-send" rv-on-click="item.send">Send</button>

  var amount = 10000 // satoshi

  var addresses = []

  var address = $("input[name=address_to]").val()
  addresses.push(address)

  mainWallet.send(amount, addresses) // gogogo! TODO Callback
})

// dangerous
$("#app").on("click", ".regenerate", function(evt){
  // TODO alert dangerous - can't execute with more than 5 millibits
  //
  // delete localStorage['swb_privateKey']
  localStorage.removeItem('swb_privateKey')
  localStorage.removeItem('swb_address')
})

$("#app").on("click", ".balance_check", function(evt){
  BchainApi.balance(mainWallet.address, function(balance){
    store.keys[0].balance     = balance
    store.keys[0].balance_btc = balance*Math.pow(10, -8)
  }.bind(this))
})

// TODO:
//
// - make transaction from utxo and propagate trough blockchain api
//
