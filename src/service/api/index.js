'use strict';

const {Router} = require(`express`);

const offer = require(`./offer.js`);
const auth = require(`./auth.js`);
const category = require(`./category.js`);
const search = require(`./search.js`);
const comment = require(`./comment.js`);

const {
  OfferService,
  AuthService,
  CategoryService,
  CommentService,
  SearchService,
} = require(`./../data-service`);

const app = new Router();

(async () => {
  auth(app, new AuthService());
  category(app, new CategoryService());
  comment(app, new CommentService());
  search(app, new SearchService());
  offer(app, new OfferService(), new CommentService(), new AuthService());
})();

module.exports = app;
