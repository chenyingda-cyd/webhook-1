'use strict';
const { URL } = require('url');

module.exports = app => {
  return class SinaController extends app.Controller {
    async getFans() {
      // 获取授权用户粉丝列表

      const { ctx } = this;
      const { uid } = ctx.query;
      if (!uid) {
        ctx.body = { code: 400, error: '校验不通过' };
        return;
      }
      const user = await app.redis.hget('uid-list', `${uid}`);
      if (!user) {
        ctx.body = {
          code: 404,
          error: '无此用户',
        };
        return;
      }
      const { access_token } = JSON.parse(user);
      let { getFans_url } = app.config.url;
      getFans_url = new URL(getFans_url);
      getFans_url.searchParams.set('access_token', access_token);
      getFans_url.searchParams.set('uids', uid);
      getFans_url = getFans_url.href;
      const result = await ctx.curl(getFans_url, {
        method: 'GET',
      });
      ctx.body = JSON.parse(result.data.toString());
    }

    async getFollow() {
      // 获取授权用户最新微博和关注人最新微博

      const { ctx } = this;
      const { uid, count } = ctx.query;
      if (!uid || !count) {
        ctx.body = { code: 400, error: '校验不通过' };
        return;
      }
      const user = await app.redis.hget('uid-list', `${uid}`);
      if (!user) {
        ctx.body = {
          code: 404,
          error: '无此用户',
        };
        return;
      }
      const { access_token } = JSON.parse(user);
      let { getFollow_url } = app.config.url;
      getFollow_url = new URL(getFollow_url);
      getFollow_url.searchParams.set('access_token', access_token);
      getFollow_url.searchParams.set('count', count);
      getFollow_url = getFollow_url.href;
      const result = await ctx.curl(getFollow_url, {
        method: 'GET',
      });
      const data = result.data;
      ctx.body = JSON.parse(data);
    }

    async getFollowers() {
      //  获取授权用户粉丝列表uid

      const { ctx } = this;
      const { uid } = ctx.query;
      if (!uid) {
        ctx.body = { code: 400, error: '校验不通过' };
        return;
      }
      const user = await app.redis.hget('uid-list', `${uid}`);
      if (!user) {
        ctx.body = {
          code: 404,
          error: '无此用户',
        };
        return;
      }
      const { access_token } = JSON.parse(user);
      let { getFollower_url } = app.config.url;
      getFollower_url = new URL(getFollower_url);
      getFollower_url.searchParams.set('access_token', access_token);
      getFollower_url.searchParams.set('uid', uid);
      getFollower_url = getFollower_url.href;
      const result = await ctx.curl(getFollower_url, {
        method: 'GET',
      });
      ctx.body = result.data.toString();
    }

    async comment() {
      // 评论接口
      const { ctx } = this;
      const { uid, id } = ctx.query;
      if (!uid || !id) {
        ctx.body = { code: 400, error: '校验不通过' };
        return;
      }
      const user = await app.redis.hget('uid-list', `${uid}`);
      if (!user) {
        ctx.body = {
          code: 404,
          error: '无此用户',
        };
        return;
      }
      const { access_token } = JSON.parse(user);
      const { createComment_url } = app.config.url;
      const result = await ctx.curl(createComment_url, {
        method: 'POST',
        dataType: 'json',
        data: {
          access_token,
          comment: '互关',
          id,
        },
      });
      ctx.body = result.data;
    }

    async getPublish() {
      // 获取授权用户最新微博

      const { ctx } = this;
      const { uid, count } = ctx.query;
      if (!uid || !count) {
        ctx.body = { code: 400, error: '校验不通过' };
        return;
      }
      const user = await app.redis.hget('uid-list', `${uid}`);
      if (!user) {
        ctx.body = {
          code: 404,
          error: '无此用户',
        };
        return;
      }
      const { access_token } = JSON.parse(user);
      let { getPublish_url } = app.config.url;
      getPublish_url = new URL(getPublish_url);
      getPublish_url.searchParams.set('access_token', access_token);
      getPublish_url.searchParams.set('count', count);
      getPublish_url = getPublish_url.href;
      console.log(getPublish_url);
      const result = await ctx.curl(getPublish_url, {
        method: 'GET',
      });
      let data = result.data.toString();
      data = JSON.parse(data);
      console.log('data', data);
      ctx.body = data;
    }

    async bindUser() {
      // 是否监听
      const { ctx } = this;
      const body = ctx.request.body;
      const { username, screen_name } = body;
      if (!username || !screen_name) {
        ctx.body = {
          code: 400,
          error: '校验不通过',
        };
        return;
      }
      if (typeof username !== 'string' || typeof screen_name !== 'string') {
        ctx.body = { code: 400, error: '校验不通过' };
        return;
      }
      await app.redis.hmset('bind_user', username, screen_name);
      ctx.body = {
        code: 200,
        data: '监听成功',
      };
    }

    async task() {
      const { ctx } = this;
      const { app } = ctx;
      const { default_uid } = app.config.sina;
      const user = await app.redis.hmget('uid-list', default_uid);
      if (user[0] === null) {
        return;
      }
      const { access_token } = JSON.parse(user);
      let { getFollow_url } = app.config.url;
      getFollow_url = new URL(getFollow_url);
      getFollow_url.searchParams.set('access_token', access_token);
      getFollow_url = getFollow_url.href;
      const result = await ctx.curl(getFollow_url, {
        method: 'GET',
      });
      let data = result.data;
      data = JSON.parse(data);
      if (data.error_code) {
        ctx.logger.error(data, '默认账户获取关注人最新微博失败');
        throw { err: data };
      }
      const { statuses } = data;
      const userName_arr = [];
      const bind_arr = await app.redis.hgetall('bind_user');
      const map = new Map();
      for (const attr in bind_arr) {
        map.set(bind_arr[attr], attr);
      }
      for (let i = 0; i < statuses.length; i++) {
        const { screen_name } = statuses[i].user;
        if (!map.has(screen_name)) {
          continue;
        }
        if (userName_arr.indexOf(screen_name) < 0) {
          userName_arr.push(screen_name);
        } else {
          continue;
        }
        const username = map.get(screen_name);
        const robot_list = await app.redis.hgetall(`bind_star${username}`);
        const { id } = statuses[i];
        for (const uid in robot_list) {
          let comment_count = await app.redis.hmget(`comment-${id}`, uid);
          if (comment_count[0] !== null) {
            comment_count = JSON.parse(comment_count);
          } else {
            comment_count = { success: 0, fail: 0 };
          }
          let { success, fail } = comment_count;
          success = parseInt(success);
          fail = parseInt(fail);
          if (success + fail > 30) {
            ctx.logger.info('对此条微博记录已超30次的评论', Date.now());
            continue;
          }
          const { createComment_url } = app.config.url;
          let comment_user = await app.redis.hmget('uid-list', `${uid}`);
          if (comment_user[0] === null) {
            continue;
          }
          comment_user = JSON.parse(comment_user);
          const commentUser_accessToken = comment_user.access_token;
          let user_comment = await app.redis.get(`user-${uid}-comment`);
          let comment = '互关';
          if (user_comment) {
            user_comment = JSON.parse(user_comment);
            const nonce = Math.floor(Math.random() * (user_comment.length));
            comment = user_comment[nonce];
          }
          const result = await ctx.curl(createComment_url, {
            method: 'POST',
            dataType: 'json',
            data: {
              access_token: commentUser_accessToken,
              comment,
              id,
            },
          });
          if (result.data.error) {
            fail += 1;
            ctx.logger.error(`评论失败-${JSON.stringify(result.data)}`);
          } else {
            success += 1;
          }
          comment_count = { success, fail };
          await app.redis.hmset(`comment-${id}`, uid, JSON.stringify(comment_count));
        }
      }
    }
  };
}
;
