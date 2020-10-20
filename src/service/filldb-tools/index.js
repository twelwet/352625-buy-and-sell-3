'use strict';

const {OfferType} = require(`./constants.js`);

const getTypes = require(`./types.js`);

const getPictures = require(`./pictures.js`);

const getAuthors = require(`./authors.js`);

const getAuth = require(`./auths.js`);

const getCategories = require(`./categories.js`);

const getOffers = require(`./offers.js`);

const getOffersCategories = require(`./offers-categories.js`);

const getComments = require(`./comments.js`);

const getContent = (count, authUserId, categoriesSentences, users, sentences, titles, commentsSentences) => {
  const types = getTypes(OfferType);
  const pictures = getPictures(count, categoriesSentences, users);
  const authors = getAuthors(users, pictures);

  const auths = getAuth(users, authUserId);
  const categories = getCategories(categoriesSentences, pictures);
  const offers = getOffers(count, sentences, titles, authors, types, pictures);

  const offersCategories = getOffersCategories(offers, categories);
  const comments = getComments(offers, authors, commentsSentences);

  return {
    types,
    pictures,
    authors,
    auths,
    categories,
    offers,
    offersCategories,
    comments,
  };
};

module.exports = getContent;
