var bitcore     = require('bitcore')
var Handlebars  = require('handlebars')

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
