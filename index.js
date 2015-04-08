var bitcore     = require('bitcore')
// var Handlebars  = require('handlebars')
var get         = require("get-next")
var rivets      = require("rivets")

var BchainApi = {

  // utxos

  unspent: function(address, handler) {
    this._getUnspentJson(
      address,
      handler
    )
  },

  _unspentUrl: function(address) {
    return "/unspent?active="+address+"&format=json"
  },

  _getUnspentJson: function(address, handler) {
    get(this._unspentOpts(address)).next(function (data, res) {
      handler(JSON.parse(data));
    }.bind(this));
  },

  _unspentOpts: function(address) {
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


// Repos.list = function(user, handler) {
//     var opts = {
//       host: "api.github.com",
//       path: "/users/" + user + "/repos",
//       headers: {
//         "user-agent": "node.js",
//       },
//       type: "all",
//       port: 443,
//       // Not really needed when running in the server with Node.
//       withCredentials: false
//     };
//
//     var result = function(handler) {
//       get(opts).next(function (data, res) {
//         handler(JSON.parse(data));
//       });
//     };
//
//     if (typeof (handler) === "function") {
//       result(handler);
//     } else {
//       return {
//         then: result
//       };
//     }
//   };
// }(this.self || global));


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


    BchainApi.unspent(YOUR_ADDRESS, function(result){
      console.log(result) // => Object { unspent_outputs: Array[1] }

      var address = "19e2eU15xKbM9pyDwjFsBJFaSeKoDxp8YT"
      var unspent_output = result.unspent_output[0] // temp

      this._bitcoreBuildTx(address, amount)
    }.bind(this))


  },

  _bitcoreBuildTx: function(address, amount) {

        return new bitcore.Transaction()
          .from({
            "address": address,
            "txid":    "695918d85f25c29ecd3d403b02eef398eda136c5136958041c2e18b0d27dce83",
            "vout":0,
            "scriptPubKey":"76a91402efd4b4f35379ca41188b624f63449c5d26b7bf88ac",
            "amount": amount
          })

          // .from(utxos)          // Feed information about what unspent outputs one can use
          // .to(address, amount)  // Add an output with the given amount of satoshis
          // .change(address)      // Sets up a change address where the rest of the funds will go
          // .sign(privkeySet)     // Signs all the inputs it can

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


// store
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

rivets.bind($('.entries'), store.keys[0])


//
// // templating lib
// var templates = {
//   compile: function(tmplName){
//     return Handlebars.compile(
//       $("#"+tmplName+"-tpl").html()
//     )
//   },
//
//   all: {},
//
//   init: function(templates) {
//     templates.forEach(function(tpl){
//       this.all[tpl] = this.compile(tpl)
//     }.bind(this))
//   }
// }
//
// // templating
// var templateNames = ["address"]
// templates.init(templateNames)
//
// var mainView = "#app .entries"
//
// // rendering
// var renderAddress = function(address, view) {
//   var html = templates.all.address(address)
//   var div = document.createElement("div");
//   div.innerHTML = html
//   document.querySelector(view).appendChild(div)
//   // $("#app").prepend(div)
// }
//
//
// // store render
// store.keys.forEach(function(address){
//   renderAddress(address, mainView)
// })
//
//
// // handlers
// $("#app").on("click", ".reveal-pvt-key", function(evt){
//   console.log(evt.target)
//   var parent  = $(evt.target).parents(".entry").get(0)
//   console.log("parent", parent)
//   var id      = parseInt(parent.dataset.id)
//   // id = store.keys.length - id // because we're prepending - but it's hard :D
//   var key = store.keys[id]
//
//   // with ember
//   // key.set('pvtHidden', false)
//
//   // without ember
//   var klass = $(parent).attr("class").split(" ").join(".")
//   // console.log(id)
//   key.pvtHidden = false
//   key.id = store.keys.length
//   renderAddress(key, mainView)
//   var elem = document.querySelectorAll("."+klass)[id]
//   elem.className = "list-group-item entry hidden"
// })

$("#app").on("click", ".reveal-pvt-key", function(evt){
  store.keys[0].pvtHidden = false
})

//
//
// $("#add-pvt-key").on("click", function(evt){
//   bitcoreActions.addKey()
//   var key = $(store.keys).last()
//
//   $(mainView).html('')
//   store.keys.forEach(function(address){
//     renderAddress(address, mainView)
//   })
// }.bind(this))



/// TODO:


// - localstorage
// - UI (bootcrap?)
// - sort with detatch
// - ember state?

// var $people = $('ul.js-people'),
//   $peopleli = $people.children('li');
//
// $peopleli.sort(function(a,b){
//   var an = a.getAttribute('data-name'),
//     bn = b.getAttribute('data-name');
//
//   if(an > bn) {
//     return 1;
//   }
//   if(an < bn) {
//     return -1;
//   }
//   return 0;
// });
//
// $peopleli.detach().appendTo($people);
