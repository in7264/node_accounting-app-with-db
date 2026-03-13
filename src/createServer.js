'use strict';

const express = require('express');
const { Op } = require('sequelize');
const {
  models: { User, Category, Expense },
} = require('./models/models');

function createServer() {
  const app = express();

  app.use(express.json());

  // ===== USERS =====
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

    const user = await User.findByPk(id);

    if (!user) {
      return res.sendStatus(404);
    }

    res.status(200).send(user);
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

  // ===== CATEGORIES =====
  app.get('/categories', async (req, res) => {
    const categories = await Category.findAll();

    res.status(200).send(categories);
  });

  app.post('/categories', async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.sendStatus(400);
    }

    const category = await Category.create({ name });

    res.status(201).send(category);
  });

  app.get('/categories/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.sendStatus(404);
    }

    res.status(200).send(category);
  });

  app.patch('/categories/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.sendStatus(404);
    }

    if (name) {
      category.name = name;
    }
    await category.save();
    res.status(200).send(category);
  });

  app.delete('/categories/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.sendStatus(404);
    }

    await category.destroy();
    res.sendStatus(204);
  });

  // ===== EXPENSES =====
  app.get('/expenses', async (req, res) => {
    const { userId, categories, from, to } = req.query;
    const where = {};

    if (userId) {
      where.userId = Number(userId);
    }

    if (categories) {
      where.category = categories;
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

    const expenses = await Expense.findAll({
      where,
      order: [['id', 'ASC']],
    });

    res.status(200).send(expenses);
  });

  app.post('/expenses', async (req, res) => {
    const { userId, spentAt, title, amount, note, category } = req.body;

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

    const expense = await Expense.create({
      userId,
      spentAt,
      title,
      amount,
      category: category || null,
      note: note || null,
    });

    res.status(201).send(expense);
  });

  app.get('/expenses/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.sendStatus(404);
    }

    res.status(200).send(expense);
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

  return app;
}

module.exports = { createServer };
