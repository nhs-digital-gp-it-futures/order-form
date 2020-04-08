import express from 'express';

export const routes = () => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send('Works');
  });

  return router;
};
