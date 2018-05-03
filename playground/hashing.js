//  const {SHA256} = require('crypto-js');
// const jwt = require('jsonwebtoken');
//
// let data = {
//   id:10
// };
//
// const token = jwt.sign(data, '123abc');
// console.log(token);
//
// const decoded = jwt.verify(token, '123abc');
// console.log(decoded);
//
// let msg = 'beeboo weeboo beeboo';
// let hash = SHA256(msg).toString();
//
// console.log(`Message: ${msg}`);
// console.log(`Hash ${hash}`);
//
// const data = {
//   id:4
// };
//
// const token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesaltbb').toString()
// }
//
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// let hashResult = SHA256(JSON.stringify(token.data) + 'somesaltbb').toString();
//
// if(hashResult === token.hash) {
//   console.log('data was not changed');
// } else {
//   console.log('data is bad');
// }
