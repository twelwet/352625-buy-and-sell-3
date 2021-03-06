'use strict';

const moment = require(`moment`);

const {db, sequelize} = require(`./../../data/db`);
const {Items} = require(`../constants.js`);


class OfferService {
  constructor(database = db, orm = sequelize) {
    this._database = database;
    this._orm = orm;
    this._freshItemsCount = Items.FRESH;
    this._mostDiscussedCount = Items.MOST_DISCUSSED;
  }

  async findAll() {
    return await this._database.Offer.findAll();
  }

  async findOne(offerId) {
    return await this._database.Offer.findByPk(offerId, {
      attributes: [`id`, `title`, `description`, `created_date`, `sum`],
      include: [{
        model: this._database.Picture,
        as: `picture`,
        attributes: [`normal`, `double`],
      }, {
        model: this._database.Type,
        as: `type`,
        attributes: [`name`],
      }, {
        model: this._database.Category,
        as: `categories`,
        attributes: [`id`, `name`],
        through: {attributes: []},

        include: {
          model: this._database.Picture,
          as: `picture`,
          attributes: [`normal`, `double`],
        }
      }, {
        model: this._database.Comment,
        as: `comments`,
        attributes: [`id`, `text`, `author_id`],

        include: {
          model: this._database.Author,
          as: `author`,
          attributes: [`firstname`, `lastname`],
          include: {
            model: this._database.Picture,
            as: `avatar`,
            attributes: [`normal`, `double`],
          }
        }
      }, {
        model: this._database.Author,
        as: `author`,
        attributes: [`id`, `firstname`, `lastname`, `email`],
      }]
    });
  }

  async findFresh() {
    return await this._database.Offer.findAll({
      attributes: [`id`, `title`, `description`, `created_date`, `sum`],

      order: [
        [`created_date`, `desc`]
      ],

      include: [{
        model: this._database.Category,
        as: `categories`,
        attributes: [`id`, `name`],
        through: {attributes: []},
      }, {
        model: this._database.Picture,
        as: `picture`,
        attributes: [`normal`, `double`],
      }, {
        model: this._database.Type,
        as: `type`,
        attributes: [`name`],
      }],

      limit: this._freshItemsCount,
    });
  }

  async findMostDiscussed() {
    const mostDiscussedItems = await this._database.Offer.findAll({
      attributes: {
        include: [[this._orm.fn(`count`, this._orm.col(`comments.id`)), `comments_count`]]
      },

      include: [{
        model: this._database.Comment,
        as: `comments`,
        attributes: [],
        duplicating: false,
      }, {
        model: this._database.Picture,
        as: `picture`,
        attributes: [`normal`, `double`],
      }, {
        model: this._database.Type,
        as: `type`,
        attributes: [`name`],
      }],
      group: [`Offer.id`, `picture.id`, `type.id`],

      order: [
        [`count`, `desc`]
      ],
      limit: this._mostDiscussedCount,
    });

    const offers = [];

    for (const item of mostDiscussedItems) {
      const offer = item.dataValues;
      offer.categories = await this._database.Category.findAll({
        attributes: [`id`, `name`],
        include: {
          model: this._database.Offer,
          as: `offers`,
          attributes: [],
          duplicating: false,
          where: {
            id: item.dataValues.id
          }
        }
      });

      offers.push(offer);
    }

    return offers;
  }

  async findAllByAuthorId(authorId) {
    return await this._database.Offer.findAll({
      attributes: [`id`, `title`, `sum`, `created_date`],
      include: [{
        model: this._database.Picture,
        as: `picture`,
        attributes: [`normal`, `double`],
      }, {
        model: this._database.Type,
        as: `type`,
        attributes: [`name`],
      }, {
        model: this._database.Category,
        as: `categories`,
        attributes: [`id`, `name`],
        through: {attributes: []},
      }, {
        model: this._database.Comment,
        as: `comments`,
        attributes: [`id`, `text`, `created_date`],

        include: {
          model: this._database.Author,
          as: `author`,
          attributes: [`firstname`, `lastname`],

          include: {
            model: this._database.Picture,
            as: `avatar`,
            attributes: [`normal`, `double`],
          }
        },
      }],

      where: {
        [`author_id`]: authorId,
      },
      order: [
        [`created_date`, `DESC`],
        [{model: this._database.Comment, as: `comments`}, `created_date`, `DESC`]
      ],
    });
  }

  async add(formData, authorId) {
    const type = await this._database.Type.findOne({
      where: {
        name: formData[`type`]
      },
    });

    let picture = {
      id: null,
    };

    if (formData[`offer_picture`]) {
      picture = await this._database.Picture.create({
        type: `item`,
        normal: formData[`offer_picture`],
        double: formData[`offer_picture`],
      });
    }

    const offer = await this._database.Offer.create({
      [`title`]: formData[`title`],
      [`description`]: formData[`description`],
      [`sum`]: formData[`sum`],
      [`created_date`]: moment(Date.now()).toISOString(),
      [`author_id`]: authorId,
      [`type_id`]: type[`id`],
      [`picture_id`]: picture[`id`],
    });

    offer.setCategories(formData[`categories`]);
  }

  async update(formData, offerId) {
    const type = await this._database.Type.findOne({
      where: {
        name: formData[`type`]
      },
    });

    const offer = await this._database.Offer.findByPk(offerId);

    let picture = {id: offer[`picture_id`]};

    if (formData[`offer_picture`]) {
      picture = await this._database.Picture.create({
        type: `item`,
        normal: formData[`offer_picture`],
        double: formData[`offer_picture`],
      });
    }

    offer[`title`] = formData[`title`];
    offer[`description`] = formData[`description`];
    offer[`sum`] = formData[`sum`];
    offer[`created_date`] = moment(Date.now()).toISOString();
    offer[`type_id`] = type[`id`];
    offer[`picture_id`] = picture[`id`];

    offer.setCategories(formData[`categories`]);

    await offer.save();
  }

  async delete(offerId) {
    await this._database.Offer.destroy({
      where: {
        id: offerId
      }
    });
  }
}

module.exports = OfferService;
