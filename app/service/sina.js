'use strict'
;

module.exports = app => {
  return class sinaService extends app.Service {
    async index() {
      return 3;
    }
  };
};
