import url from 'url';
import passport from 'passport';
import { Strategy, Issuer } from 'openid-client';
import session from 'express-session';
import {
  oidcBaseUri, baseUrl, oidcClientId, oidcClientSecret, appBaseUri, maxCookieAge, cookieSecret,
} from './config';

export class AuthProvider {
  constructor() {
    this.passport = passport;

    Issuer.discover(oidcBaseUri)
      .then((issuer) => {
        this.client = new issuer.Client({
          client_id: oidcClientId,
          client_secret: oidcClientSecret,
        });

        const params = {
          client_id: oidcClientId,
          redirect_uri: `${appBaseUri}${baseUrl}/oauth/callback`,
          scope: 'openid profile Organisation',
        };

        const passReqToCallback = true;

        const usePKCE = 'S256';

        this.passport.use('oidc', new Strategy({
          client: this.client,
          params,
          passReqToCallback,
          usePKCE,
        },
        (req, tokenset, userinfo, done) => {
          req.session.accessToken = tokenset;

          return done(null, userinfo);
        }));
      });

    this.passport.serializeUser((user, done) => {
      done(null, user);
    });

    this.passport.deserializeUser((obj, done) => {
      done(null, obj);
    });
  }

  setup(app) {
    app.use(session({
      name: 'token',
      secret: cookieSecret,
      resave: false,
      saveUninitialized: true,
      maxAge: maxCookieAge,
    }));

    app.use(this.passport.initialize());
    app.use(this.passport.session());
  }

  login() {
    return (req, res, next) => {
      const options = {
        state: url.parse(req.headers.referer).pathname,
      };
      this.passport.authenticate('oidc', options)(req, res, next);
    };
  }

  loginCallback() {
    return (req, res, next) => {
      const redirectUrl = req.query.state;
      const optionsWithUrl = {
        callback: true,
        failureRedirect: '/',
        successReturnToOrRedirect: redirectUrl,
      };

      this.passport.authenticate('oidc', optionsWithUrl)(req, res, next);
    };
  }

  logout({ idToken }) {
    return this.client.endSessionUrl({
      id_token_hint: idToken,
      post_logout_redirect_uri: `${appBaseUri}${baseUrl}/signout-callback-oidc`,
    });
  }

  authorise() {
    return (req, res, next) => {
      if (!req.user) {
        req.headers.referer = `${req.originalUrl}`;
        this.login()(req, res, next);
      } else if (req.user && req.user.organisation) {
        next();
      } else {
        throw new Error('Not authorised matey');
      }
    };
  }
}
