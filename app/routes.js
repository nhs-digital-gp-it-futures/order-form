import express from 'express';
import config from './config';
import { getIndexContext } from './pages/index/controller';

const addContext = ({ context }) => ({
  ...context,
  config,
});

export const routes = () => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const context = await getIndexContext();
    res.render('pages/index/template.njk', addContext({ context }));
  });

  return router;
};
