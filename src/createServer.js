/* eslint-disable prettier/prettier */
'use strict';

const express = require('express');
const { Op } = require('sequelize');

function createServer() {
  const {
    models: { User, Expense },
  } = require('./models/models');

  const app = express();

  app.use(express.json());

  app.get('/users', async (req, res) => {
    const users = await User.findAll();

    res.status(200).send(users);
  });

  app.post('/users', async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.sendStatus(400);
    }

    const newUser = await User.create({ name });

    res.status(201).send(newUser);
  });

  app.get('/users/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const foundUser = await User.findByPk(id);

    if (!foundUser) {
      return res.sendStatus(404);
    }

    res.status(200).send(foundUser);
  });

  app.delete('/users/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.sendStatus(404);
    }

    await user.destroy();
    res.sendStatus(204);
  });

  app.patch('/users/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.sendStatus(404);
    }

    if (name) {
      user.name = name;
    }

    await user.save();
    res.status(200).send(user);
  });

  app.get('/expenses', async (req, res) => {
    const { userId, categories, from, to } = req.query;

    const where = {};

    if (userId) {
      where.userId = Number(userId);
    }

    if (categories) {
      const cats = Array.isArray(categories) ? categories : [categories];

      where.category = { [Op.in]: cats };
    }

    if (from || to) {
      where.spentAt = {};
    }

    if (from) {
      where.spentAt[Op.gte] = new Date(from);
    }

    if (to) {
      where.spentAt[Op.lte] = new Date(to);
    }

    const filteredExpenses = await Expense.findAll({
      where,
      order: [['id', 'ASC']],
    });

    res.status(200).send(filteredExpenses);
  });

  app.post('/expenses', async (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).send({ message: 'Invalid userId' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    if (!spentAt || !title || amount === undefined) {
      return res.status(400).send({ message: 'Missing required fields' });
    }

    const newExpense = await Expense.create({
      userId,
      spentAt,
      title,
      amount,
      category: category || null,
      note: note || null,
    });

    res.status(201).send(newExpense);
  });

  app.get('/expenses/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const foundExpense = await Expense.findByPk(id);

    if (!foundExpense) {
      return res.sendStatus(404);
    }

    res.status(200).send(foundExpense);
  });

  app.delete('/expenses/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.sendStatus(404);
    }

    await expense.destroy();
    res.sendStatus(204);
  });

  app.patch('/expenses/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { spentAt, title, amount, category, note } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.sendStatus(404);
    }

    await expense.update({
      spentAt,
      title,
      amount,
      category,
      note,
    });

    res.status(200).send(expense);
  });

  return app;
}

module.exports = { createServer };
