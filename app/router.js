'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { config } = app;
  const version = config.apiVersion;
  require('./router/' + version + '/user')(app);// 用户
  require('./router/' + version + '/admin')(app);// 用户
};
