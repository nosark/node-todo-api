const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

const id = '5ad565000e5e32146915c9d3'; //ObjectID for query
const uid = '6acfb7b0e0af2d0c0fc20a8411aa';
// if(!ObjectID.isValid(id)) {
//   console.log('ID not valid!');
// }
// Todo.find({
//   _id : id
// }).then((todos) => {
//   console.log('Todos', todos);
// });
//
// Todo.findOne({
//   _id : id
// }).then((todo) => {
//   console.log('Todo', todo);
// });
// Todo.findById(id).then((todo) => {
//   if(!todo) {
//     console.log('Id not found');
//   }
//   console.log('Todo by id', todo);
// }).catch((e) => console.log(e));
User.findById(uid).then((user) => {
  if(!user) {
    return console.log('user id not found');
  }
  console.log('User by id', user);
}).catch((e) => console.log(e));
