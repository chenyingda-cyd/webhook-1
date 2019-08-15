'use strict';
// const { URL } = require('url');

module.exports = app => {
  return class HomeController extends app.Controller {

    async sina() {
      // 请求授权
      const { ctx } = this;
      const { authorize_url, redirect_uri } = app.config.url;
      const { appKey } = app.config.sina;
      const url = authorize_url + `client_id=${appKey}&redirect_uri=${redirect_uri}`;
      console.log('this is url', url);
      await ctx.redirect(url);
    }

    async callback() {
      // 授权回调，带code，通过code获取access_token
      const { ctx } = this;
      const { code } = ctx.query;
      const { accessToken_url, redirect_uri } = app.config.url;
      const { appKey, appSecret } = app.config.sina;
      const result = await ctx.curl(accessToken_url, {
        method: 'post',
        dataType: 'json',
        data: {
          client_id: appKey,
          client_secret: appSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri,
        },
      });
      if (result.data.error_code) {
        ctx.body = {
          code: 400,
          data: '授权失败',
        };
        return;
      }
      const token = await app.jwt.sign({ uid: result.data.uid }, app.config.jwtkey, { expiresIn: 3600 * 24 * 20 });
      await app.redis.hmset('uid-list', result.data.uid, JSON.stringify(result.data));
      await ctx.redirect(`${app.config.url.origin_url}/html/sina/?token=${token}`);
    }

    async createComment() {
      const { ctx } = this;
      const user = ctx.user;
      const body = ctx.request.body;
      const { comment } = body;
      let user_comment = await app.redis.get(`user-${user.uid}-comment`);
      if (!user_comment) {
        user_comment = [];
      } else {
        user_comment = JSON.parse(user_comment);
      }
      user_comment.push(comment);
      await app.redis.set(`user-${user.uid}-comment`, JSON.stringify(user_comment));
      ctx.body = {
        code: 200,
        data: '创建成功',
      };
    }

    async bindUser() {
      const { ctx } = this;
      const body = ctx.request.body;
      const { username } = body;
      if (!username || typeof username !== 'string') {
        ctx.body = {
          code: 400,
          error: '校验不通过',
        };
        return;
      }
      const bind_user = await app.redis.hmget('bind_user', username);
      if (!bind_user) {
        ctx.body = { code: 400, error: '该用户不在监听列表当中' };
        return;
      }
      const user = ctx.user;
      const { uid } = user;
      await app.redis.hmset(`bind_star${username}`, uid, 1);
      ctx.body = {
        code: 200,
        data: '监听成功',
      };
    }

    async getBindUser() {
      const { ctx } = this;
      const bind_arr = await app.redis.hgetall('bind_user');
      const data = [];
      for (const username in bind_arr) {
        data.push(username);
      }
      ctx.body = {
        code: 200,
        data,
      };
    }
  };
};
