'use strict'
;
module.exports = {
  schedule: {
    interval: '600s',
    type: 'worker',
  },
  async task(ctx) {
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
  },
}
;
