'use strict';
const { app, assert } = require('egg-mock/bootstrap');

describe('test/controller/v1/admin.sina.test.js', () => {
  describe('GET /', () => {
    it('should status 200 and get the body', async () => {
      // await app.httpRequest()
      //   .get('/')
      //   .expect(404);
      const ctx = app.mockContext();
      assert(ctx.url = '/');
      const i = 1;
      assert(i < 2);
      console.log('this is ex i', i);
    });
  });
})
;
