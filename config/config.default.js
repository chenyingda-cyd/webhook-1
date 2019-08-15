/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1564735798666_6017';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
  };

  // 安全配置
  config.security = {
    domainWhiteList: [],
    csrf: {
      enable: true,
    },
  };

  // redis配置
  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: '',
      db: 0,
    },
  };

  config.mongoose = {
    url: 'mongodb://127.0.0.1/example',
    options: {},
    // mongoose global plugins, expected a function or an array of function and options
    // plugins: [ createdPlugin, [ updatedPlugin, pluginOptions ]],
  };

  // api版本
  config.apiVersion = 'v1';
  // api前缀
  config.apiPrefix = '/sina_api/' + config.apiVersion;

  config.url = {
    origin_url: 'http://cydcyd.yhc168.cn',
    redirect_uri: 'http://cydcyd.yhc168.cn' + config.apiPrefix + '/user/callback',
    authorize_url: 'https://api.weibo.com/oauth2/authorize?',
    accessToken_url: 'https://api.weibo.com/oauth2/access_token',
    getFans_url: 'https://api.weibo.com/2/users/counts.json?',
    getFollow_url: 'https://api.weibo.com/2/statuses/home_timeline.json?',
    getFollower_url: 'https://api.weibo.com/2/friendships/followers/ids.json?',
    getPublish_url: 'https://api.weibo.com/2/statuses/user_timeline.json?',
    createComment_url: 'https://api.weibo.com/2/comments/create.json',
  };

  config.sina = {
    appKey: '2273759700',
    appSecret: 'd0d6401afee035e8c5feed5d793ce4d5',
    default_uid: '7278687107',
  };

  config.jwtkey = 'sinasecret' + config.keys;

  config.cluster = {
    listen: {
      port: 7002,
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
