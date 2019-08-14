'use strict'
;
const { app, assert } = require('egg-mock/bootstrap');
describe('index()', async () => {
  const ctx = app.mockContext();
  const result = await ctx.service.sina.index();
  assert(result === 4);
  it('should correct', async () => {
  });
});
