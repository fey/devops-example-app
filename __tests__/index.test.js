const supertest = require('supertest');
const _ = require('lodash');

const getApp = require('../server/index.js');

describe('app', () => {
  let app;

  beforeAll(async () => {
    app = getApp();
    await app.ready();
  });

  beforeEach(() => {
    _.unset(process.env, 'SERVER_IP');
  });

  it('main page without environment variable SERVER_IP', async () => {
    const res = await supertest(app.server)
      .get('/')
      .expect(200);

    expect(res.text).toMatch('Привет от Хекслета!');
    expect(res.text).toMatch('Приложение запущено на сервере с IP: не определен');
  });

  it('main page with environment variable SERVER_IP', async () => {
    process.env.SERVER_IP = '10.11.12.13';

    const res = await supertest(app.server)
      .get('/')
      .expect(200);

    expect(res.text).toMatch('Привет от Хекслета!');
    expect(res.text).toMatch(`Приложение запущено на сервере с IP: ${process.env.SERVER_IP}`);
  });

  afterAll(() => {
    app.close();
  });
});
