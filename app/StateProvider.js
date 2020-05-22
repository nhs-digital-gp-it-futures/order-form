import session from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';

export class StateProvider {
  constructor() {
    this.RedisStore = connectRedis(session);
    const redisTlsConfig = this.config.redisTls === 'true'
      ? { auth_pass: this.config.redisPass, tls: { servername: this.config.redisUrl } }
      : undefined;
    this.redisClient = redis.createClient(
      this.config.redisPort, this.config.redisUrl, redisTlsConfig,
    );
  }

  setup(app) {
    app.use(session({
      store: new this.RedisStore({ client: this.redisClient }),
      name: 'token',
      secret: this.config.cookieSecret,
      resave: false,
      saveUninitialized: true,
      maxAge: this.config.maxCookieAge,
    }));
  }

  saveListToSession({ key, values }) {
    this.redisClient.hmset(key, values);
  }

  getFromSession({ key }) {
    this.redisClient.get(key);
  }
}
