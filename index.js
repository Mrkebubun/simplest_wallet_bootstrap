var bitcore = require('bitcore')

var privateKey  = new bitcore.PrivateKey();
var address     = privateKey.publicKey.toAddress();


console.log("privateKey", privateKey.toString(), privateKey)
console.log("address",    address.toString(),    address   )
