'use strict';

/**
 * @param {Egg.Application} app - egg application
 */


module.exports = app => {
  const { router, controller, middlewares, config } = app;
  const userRouter = router.namespace(config.apiPrefix + '/user');
  const userController = controller.v1.user;
  const userAuth = middlewares.uidAuth();
  userRouter.get('/callback', userController.home.callback);
  userRouter.get('/sina', userController.home.sina);
  userRouter.post('/createComment', userAuth, userController.home.createComment);
  userRouter.post('/bindUser', userAuth, userController.home.bindUser);
  userRouter.get('/getBindUser', userController.home.getBindUser);
};
