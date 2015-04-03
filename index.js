var bitcore     = require('bitcore')
var Handlebars  = require('handlebars')

// store
var store  = {
  keys: []
}

// bitcore actions - add keypair to store
var bitcoreActions = {
  addKey: function() {
    store.keys.push(this._generateKey())
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



// rendering
var renderAddress = function(address) {
  var html = templates.all.address(address)
  var div = document.createElement("div");
  div.innerHTML = html
  document.querySelector("body").appendChild(div)
}


// store render
store.keys.forEach(function(address){
  renderAddress(address)
})


// handlers

$("#reveal-pvt-key").on("click", function(evt){
  console.log(evt.target)
})
