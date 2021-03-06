'use strict';

const express = require(`express`);
const request = require(`supertest`);

const comment = require(`./comment.js`);
const {CommentService, AuthService} = require(`../data-service`);

const {HttpCode, PathName, Empty} = require(`../constants.js`);
const mocks = require(`../../data/db/fake/mocks.js`);
const {fakeDb, initDb, dropDb, fakeSequelize} = require(`../../data/db/fake`);
const {loginByAuthorId, logoutByAuthorId} = require(`./test-utils.js`);

const Comment = {
  RIGHT_ID: 1,
  WRONG_ID: `wr0ng1d`,
  NON_EXIST_ID: 123456789,
};

const Offer = {
  RIGHT_ID: 1,
  WRONG_ID: `wr0ngOffer1d`,
};

const Author = {
  RIGHT_ID: 1,
};

const commentService = new CommentService(fakeDb);
const authService = new AuthService(fakeDb);

const createAPI = () => {
  const app = express();
  app.use(express.json());
  comment(app, commentService, authService);
  return app;
};

beforeAll(async () => {
  await initDb(mocks, fakeSequelize);
});

afterAll(async () => {
  await dropDb(fakeSequelize);
  await fakeSequelize.close();
});


describe(`When GET '/${PathName.COMMENTS}'`, () => {
  const app = createAPI();

  let response;
  let result;

  beforeAll(async () => {
    const data = await commentService.findAll();
    response = await request(app)
      .get(`/${PathName.COMMENTS}`);
    result = JSON.parse(JSON.stringify(data));
  });

  test(`status code should be ${HttpCode.OK}`, () => {
    expect(response.statusCode).toBe(HttpCode.OK);
  });

  test(`response should be equal to categories from db`, () => {
    expect(response.body).toStrictEqual(result);
  });
});


describe(`When GET '/${PathName.COMMENTS}/${Comment.RIGHT_ID}'`, () => {
  const app = createAPI();

  let response;
  let result;

  beforeAll(async () => {
    const data = await commentService.findOne(Comment.RIGHT_ID);
    response = await request(app)
      .get(`/${PathName.COMMENTS}/${Comment.RIGHT_ID}`);
    result = JSON.parse(JSON.stringify(data));
  });

  test(`status code should be ${HttpCode.OK}`, () => {
    expect(response.statusCode).toBe(HttpCode.OK);
  });

  test(`response should be equal to comment from database`, () => {
    expect(response.body).toStrictEqual(result);
  });
});


describe(`When GET '/${PathName.COMMENTS}/${Comment.WRONG_ID}'`, () => {
  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/${PathName.COMMENTS}/${Comment.WRONG_ID}`);
  });

  test(`status code should be ${HttpCode.BAD_REQUEST}`, () => {
    expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
  });

  test(`response should be equal to ${Empty.COMMENT}`, () => {
    expect(response.body).toStrictEqual(Empty.COMMENT);
  });
});


describe(`When GET '/${PathName.COMMENTS}/byOfferId/${Offer.RIGHT_ID}'`, () => {
  const app = createAPI();

  let response;
  let result;

  beforeAll(async () => {
    const data = await commentService.findAllByOfferId(Offer.RIGHT_ID);
    response = await request(app)
      .get(`/${PathName.COMMENTS}/byOfferId/${Offer.RIGHT_ID}`);
    result = JSON.parse(JSON.stringify(data));
  });

  test(`status code should be ${HttpCode.OK}`, () => {
    expect(response.statusCode).toBe(HttpCode.OK);
  });

  test(`response should be equal to comments from database`, () => {
    expect(response.body).toStrictEqual(result);
  });
});


describe(`When GET '/${PathName.COMMENTS}/byOfferId/${Offer.WRONG_ID}'`, () => {
  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/${PathName.COMMENTS}/byOfferId/${Offer.WRONG_ID}`);
  });

  test(`status code should be ${HttpCode.BAD_REQUEST}`, () => {
    expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
  });

  test(`response should be equal to ${Empty.COMMENTS}`, () => {
    expect(response.body).toStrictEqual(Empty.COMMENTS);
  });
});


describe(`When DELETE '/${PathName.COMMENTS}/${Comment.RIGHT_ID}' in logout mode`, () => {
  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/${PathName.COMMENTS}/${Comment.RIGHT_ID}`);
  });

  test(`status code should be ${HttpCode.UNAUTHORIZED}`, () => {
    expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
  });

  test(`Response should be 'Unauthorized access'`, () => {
    expect(response.body).toBe(`Unauthorized access`);
  });
});


describe(`When DELETE '/${PathName.COMMENTS}/${Comment.RIGHT_ID}' in login mode`, () => {
  const app = createAPI();

  let response;

  beforeAll(async () => {
    await loginByAuthorId(Author.RIGHT_ID, fakeDb);
    response = await request(app)
      .delete(`/${PathName.COMMENTS}/${Comment.RIGHT_ID}`);
  });

  afterAll(async () => {
    await logoutByAuthorId(Author.RIGHT_ID, fakeDb);
  });

  test(`status code should be ${HttpCode.OK}`, () => {
    expect(response.statusCode).toBe(HttpCode.OK);
  });

  test(`Response should be 'Comment is deleted'`, () => {
    expect(response.body).toBe(`Comment is deleted`);
  });
});


describe(`When DELETE '/${PathName.COMMENTS}/${Comment.WRONG_ID}' in login mode`, () => {
  const app = createAPI();

  let response;

  beforeAll(async () => {
    await loginByAuthorId(Author.RIGHT_ID, fakeDb);
    response = await request(app)
      .delete(`/${PathName.COMMENTS}/${Comment.WRONG_ID}`);
  });

  afterAll(async () => {
    await logoutByAuthorId(Author.RIGHT_ID, fakeDb);
  });

  test(`status code should be ${HttpCode.BAD_REQUEST}`, () => {
    expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
  });

  test(`Response should be 'Incorrect id'`, () => {
    expect(response.body).toBe(`Incorrect id`);
  });
});


describe(`When DELETE '/${PathName.COMMENTS}/${Comment.NON_EXIST_ID}' in login mode`, () => {
  const app = createAPI();

  let response;

  beforeAll(async () => {
    await loginByAuthorId(Author.RIGHT_ID, fakeDb);
    response = await request(app)
      .delete(`/${PathName.COMMENTS}/${Comment.NON_EXIST_ID}`);
  });

  afterAll(async () => {
    await logoutByAuthorId(Author.RIGHT_ID, fakeDb);
  });

  test(`status code should be ${HttpCode.BAD_REQUEST}`, () => {
    expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
  });

  test(`Response should be 'Data is not exist'`, () => {
    expect(response.body).toBe(`Data is not exist`);
  });
});


describe(`When DELETE '/${PathName.COMMENTS}/${Comment.WRONG_ID}' in logout mode`, () => {
  const app = createAPI();

  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/${PathName.COMMENTS}/${Comment.WRONG_ID}`);
  });

  test(`status code should be ${HttpCode.UNAUTHORIZED}`, () => {
    expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
  });

  test(`Response should be 'Unauthorized access'`, () => {
    expect(response.body).toBe(`Unauthorized access`);
  });
});
