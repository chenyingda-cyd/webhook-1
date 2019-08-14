'use strict';

module.exports = () => {
  return async (ctx, next) => {
    const app = ctx.app;
    const token = ctx.headers.authorization;
    if (!token) {
      ctx.throw(401, 'customer not authorized');
    }
    let customer;
    try {
      customer = await app.jwt.verify(token, app.config.jwtkey);
    } catch (err) {
      ctx.throw(401, 'customer not authorized');
    }
    const { uid } = customer;
    console.log('this is uid', uid);
    const { origin_url } = app.config.url;
    const user = await app.redis.hget('uid-list', uid);
    if (!user) {
      await ctx.redirect(origin_url + app.config.apiPrefix + '/sina');
      return;
    }
    ctx.user = JSON.parse(user);
    await next();
  };
};
