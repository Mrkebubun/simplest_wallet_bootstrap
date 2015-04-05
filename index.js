var bitcore     = require('bitcore')
var Handlebars  = require('handlebars')
var get         = require("get-next")

var BchainApi = {

  unspent: function(address) {
    this.getJson this._unspentUrl(address)
  },

  _unspentUrl: function(address) {
    return "https://blockchain.info/unspent?active="+address+"&format=json"
  }

}


var bitcoin = {

  init: function() {
    this._generateKeypair()
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


  // private

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

    return new bitcore.Transaction()
      .from({
        "address": address,
        "txid":    "695918d85f25c29ecd3d403b02eef398eda136c5136958041c2e18b0d27dce83",
        "vout":0,
        "scriptPubKey":"76a91402efd4b4f35379ca41188b624f63449c5d26b7bf88ac",
        "amount": amount
      })

      .from(utxos)          // Feed information about what unspent outputs one can use
    .to(address, amount)  // Add an output with the given amount of satoshis
    .change(address)      // Sets up a change address where the rest of the funds will go
    .sign(privkeySet)     // Signs all the inputs it can
  },



}


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
    store.keys.push(key)
  },

  _generateKey: function() {
    var privateKey  = new bitcore.PrivateKey()
    var address     = privateKey.publicKey.toAddress()
    // console.log("privateKey", privateKey.toString(), privateKey)
    // console.log("address",    address.toString(),    address   )
    return { privateKey: privateKey, address: address }
  }
}


// seed data
bitcoreActions.addKey()
bitcoreActions.addKey()




// templating lib
var templates = {
  compile: function(tmplName){
    return Handlebars.compile(
      $("#"+tmplName+"-tpl").html()
    )
  },

  all: {},

  init: function(templates) {
    templates.forEach(function(tpl){
      this.all[tpl] = this.compile(tpl)
    }.bind(this))
  }
}

// templating
var templateNames = ["address"]
templates.init(templateNames)

var mainView = "#app .entries"

// rendering
var renderAddress = function(address, view) {
  var html = templates.all.address(address)
  var div = document.createElement("div");
  div.innerHTML = html
  document.querySelector(view).appendChild(div)
  // $("#app").prepend(div)
}


// store render
store.keys.forEach(function(address){
  renderAddress(address, mainView)
})


// handlers
$("#app").on("click", ".reveal-pvt-key", function(evt){
  console.log(evt.target)
  var parent  = $(evt.target).parents(".entry").get(0)
  console.log("parent", parent)
  var id      = parseInt(parent.dataset.id)
  // id = store.keys.length - id // because we're prepending - but it's hard :D
  var key = store.keys[id]

  // with ember
  // key.set('pvtHidden', false)

  // without ember
  var klass = $(parent).attr("class").split(" ").join(".")
  // console.log(id)
  key.pvtHidden = false
  key.id = store.keys.length
  renderAddress(key, mainView)
  var elem = document.querySelectorAll("."+klass)[id]
  elem.className = "list-group-item entry hidden"
})


$("#add-pvt-key").on("click", function(evt){
  bitcoreActions.addKey()
  var key = $(store.keys).last()

  $(mainView).html('')
  store.keys.forEach(function(address){
    renderAddress(address, mainView)
  })
}.bind(this))



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
