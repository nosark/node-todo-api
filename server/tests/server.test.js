const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');

const {
  todos,
  populateTodos,
  users,
  populateUsers,
} = require('./seed/seed');

//  empty database before tests
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text test';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Todo.find({ text }).then((todosArr) => {
          expect(todosArr.length).toBe(1);
          expect(todosArr[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Todo.find().then((todosArr) => {
          expect(todosArr.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    const testID = new ObjectID();
    request(app)
      .get(`/todos/${testID.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-objectIDs', (done) => {
    const fakeID = '123';
    request(app)
      .get(`/todos/${fakeID}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const hexID = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(hexID).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch(e => done(e));
      });
  });

  it('should not remove a todo that user didnt create', (done) => {
    const hexID = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(hexID).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch(e => done(e));
      });
  });

  it('should return 404 if todo not found', (done) => {
    const testID = new ObjectID();
    request(app)
      .delete(`/todos/${testID.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    const fakeID = '123';
    request(app)
      .delete(`/todos/${fakeID}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const testID = todos[1]._id.toHexString();
    const testText = 'new second test todo text';
    request(app)
      .patch(`/todos/${testID}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ text: testText, completed: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(testText);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toEqual(expect.any(Number));
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(testID).then((todo) => {
          expect(todo.text).toBe(testText);
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toEqual(expect.any(Number));
          done();
        }).catch(e => done(e));
      });
  });

  it('should not update the todo', (done) => {
    const testID = todos[1]._id.toHexString();
    const testText = 'new second test todo text';
    request(app)
      .patch(`/todos/${testID}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ text: testText, completed: true })
      .expect(404)
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(testID).then((todo) => {
          expect(todo.text).not.toBe(testText);
          expect(todo.completed).toBe(true);
          expect(todo.completedAt).toEqual(expect.any(Number));
          done();
        }).catch(e => done(e));
      });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    const testID = todos[0]._id.toHexString();
    const testText = 'new first test todo text';

    request(app)
      .patch(`/todos/${testID}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ text: testText, completed: false })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(testText);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return Todo.findById(testID).then((todo) => {
          expect(todo.text).toBe(testText);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBe(null);
          done();
        }).catch(e => done(e));
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
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'testuser123@testymctest.com';
    const password = 'testytest123';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return User.findOne({ email }).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch(e => done(e));
      });
  });

  it('should return validation errors if request is invalid', (done) => {
    const email = 'invalidEmail';
    const password = '123abc';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('should not create a user if email is in use', (done) => {
    const { email } = users[0];
    const password = 'password123';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({ email: users[1].email, password: users[1].password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        return User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth'],
          });
          done();
        }).catch(e => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    const fakePassword = 'nottherealpassword';
    request(app)
      .post('/users/login')
      .send({ email: users[1].email, password: fakePassword })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        return User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toBeTruthy();
          done();
        }).catch(e => done(e));
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
      .end((err) => {
        if (err) {
          return done(err);
        }

        return User.findById(users[0]._id).then((user) => {
          expect(user.tokens[0]).toBeFalsy();
          done();
        }).catch(e => done(e));
      });
  });
});
