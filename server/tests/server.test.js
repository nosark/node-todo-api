const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

//empty database before tests
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text test';
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    let testID = new ObjectID();
    request(app)
      .get(`/todos/${testID.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-objectIDs', (done) => {
    let fakeID = '123';
    request(app)
      .get(`/todos/${fakeID}`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexID = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexID);
      }).end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.findById(hexID).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo not found', (done) => {
    let testID = new ObjectID();
    request(app)
      .delete(`/todos/${testID.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    let fakeID = '123';
    request(app)
      .delete(`/todos/${fakeID}`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let testID = todos[1]._id.toHexString();
    let testText = 'new second test todo text';
    request(app)
    .patch(`/todos/${testID}`)
    .send({text: testText, completed: true})
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(testText);
      expect(res.body.todo.completed).toBe(true);
      expect(res.body.todo.completedAt).toEqual(expect.any(Number));
    }).end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.findById(testID).then((todo) => {
        expect(todo.text).toBe(testText);
        expect(todo.completed).toBe(true);
        expect(todo.completedAt).toEqual(expect.any(Number));
        done();
      }).catch((e) => done(e));
    });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    let testID = todos[0]._id.toHexString();
    let testText = 'new first test todo text';

    request(app)
    .patch(`/todos/${testID}`)
    .send({text: testText, completed:false})
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(testText);
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBe(null);
    }).end((err, res) => {
      if(err) {
        return done(err);
      }

      Todo.findById(testID).then((todo) => {
        expect(todo.text).toBe(testText);
        expect(todo.completed).toBe(false);
        expect(todo.completedAt).toBe(null);
        done();
      }).catch((e) => done(e));
    });
  });
});

describe('GET /users/me', () => {
  it('should return a user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      }).end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res) => {
      expect(res.body).toEqual({});
    }).end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'testuser123@testymctest.com';
    const password = 'testytest123';

    request(app)
    .post('/users')
    .send({email, password})
    .expect(200)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeTruthy();
      expect(res.body._id).toBeTruthy();
      expect(res.body.email).toBe(email);
    }).end((err) => {
      if(err) {
        return done(err);
      }

      User.findOne({email}).then((user) => {
        expect(user).toBeTruthy();
        expect(user.password).not.toBe(password);
        done();
      }).catch((e) => done(e));
    });
  });

  it('should return validation errors if request is invalid', (done) => {
    const email = 'invalidEmail';
    const password = '123abc';

    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });

  it('should not create a user if email is in use', (done) => {
    const email = users[0].email;
    const password = 'password123'

    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
    .post('/users/login')
    .send({email: users[1].email, password: users[1].password})
    .expect(200)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeTruthy();
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      User.findById(users[1]._id).then((user) => {
        expect(user.tokens[0]).toMatchObject({
          access: 'auth',
          token: res.headers['x-auth']
        });
        done();
      }).catch((e) => done(e));
    });
  });

  it('should reject invalid login', (done) => {
    const fakePassword = 'nottherealpassword';
    request(app)
    .post('/users/login')
    .send({email: users[1].email, password: fakePassword})
    .expect(400)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeFalsy();
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      User.findById(users[1]._id).then((user) => {
        expect(user.tokens[0]).toBeFalsy();
        done();
      }).catch((e) => done(e));
    });
  });
});

describe('DELETE /users/me/token', () => {
  it('should delete auth token on logout', (done) => {
    request(app)
    .delete('/users/me/token')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeFalsy();
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      User.findById(users[0]._id).then((user) => {
        expect(user.tokens[0]).toBeFalsy();
        done();
      }).catch((e) => done(e));
    });
  });
})
