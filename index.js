var bitcore     = require('bitcore')
var Handlebars  = require('handlebars')

var privateKey  = new bitcore.PrivateKey();
var address     = privateKey.publicKey.toAddress();


console.log("privateKey", privateKey.toString(), privateKey)
console.log("address",    address.toString(),    address   )



var source   = $("#address-tpl").html()
var template = Handlebars.compile(source)

var context  = {
  address: address,
  privateKey: privateKey
}
var html     = template(context)


var div = document.createElement("div");
div.innerHTML = html
document.querySelector("body").appendChild(div)
