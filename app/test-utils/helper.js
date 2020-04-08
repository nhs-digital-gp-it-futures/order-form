import cheerio from 'cheerio';
import request from 'supertest';

export const extractInnerText = async (element) => {
  const elementInnerText = await element.innerText;
  return elementInnerText.trim();
};

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

export const setFakeCookie = async (app, getPath) => {
  let cookies;
  await request(app)
    .get(getPath)
    .set('Cookie', ['cookie1=cookie1value'])
    .then((getRes) => {
      cookies = getRes.headers['set-cookie'];
    });

  return { modifiedApp: app, cookies };
};
