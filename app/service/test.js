'use strict';

module.exports = app => { 
  return class webhookService extends app.Service { 
    async index() { 
      console.log('???')
      console.log('from branch prod')
    }
  }
}