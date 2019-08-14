'use strict';

/**
 * @param {Egg.Application} app - egg application
 */


module.exports = app => {
  const { router, controller, config } = app;
  const adminRouter = router.namespace(config.apiPrefix + '/admin');
  const adminController = controller.v1.admin;
  adminRouter.get('/getFans', adminController.sina.getFans);
  adminRouter.get('/getFollow', adminController.sina.getFollow);
  adminRouter.get('/getFollowers', adminController.sina.getFollowers);
  adminRouter.get('/getPublish', adminController.sina.getPublish);
  adminRouter.get('/comment', adminController.sina.comment);
  adminRouter.post('/bindUser', adminController.sina.bindUser);
  adminRouter.get('/task', adminController.sina.task);
};
