import cheerio from 'cheerio';
import request from 'supertest';

const extractCsrfToken = (res) => {
  const $ = cheerio.load(res.text);
  return $('[name=_csrf]').val();
};

export const getCsrfTokenFromGet = async (app, getPath, authenticationCookie) => {
  let cookies;
  let csrfToken;

  await request(app)
    .get(getPath)
    .set('Cookie', authenticationCookie)
    .then((getRes) => {
      cookies = getRes.headers['set-cookie'];
      csrfToken = extractCsrfToken(getRes);
    });
  return { cookies, csrfToken };
};
