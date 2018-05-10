const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../../models/user');
const {Todo} = require('./../../models/todo');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'exampleuser@testsaregood.com',
  password: 'testsaregood123',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, 'somesaltysaltsalt').toString()
  }]
}, {
  _id: userTwoId,
  email: 'someinvaliduser@invalid.com',
  password: 'imsoinvalid123'
}];

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 1234
}];


//empty database before tests
const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let user1 = new User(users[0]).save();
    let user2 = new User(users[1]).save();

    return Promise.all([user1, user2]);
  }).then(() => done())
    .catch((e) => done(e));
};
module.exports = {todos, populateTodos, users, populateUsers};
