const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

const TALKER_JSON = './talker.json';

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

const readTalkers = async () => {
  try {
    const response = await fs.readFile(TALKER_JSON, 'utf-8');
    const talkerList = JSON.parse(response);
    return talkerList;  
  } catch (e) {
    return 'erro';
  }
};

app.get('/talker', async (req, res) => {
  const talkers = await readTalkers();
  if (talkers.length > 0) {
    return res.status(200).json(talkers);
  } 
  return res.status(200).json([]);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await readTalkers();
  const talkersId = talkers.find((name) => name.id === Number(id));
  
  if (!talkersId) {
   return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(200).send(talkersId);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const verifyEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
   return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!verifyEmail.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  const token = crypto.randomBytes(8).toString('hex');
  return res.status(200).json({ token });
});

const addAuthorization = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  if (authorization.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  next();
}; 

const addName = (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
};

const addAge = (req, res, next) => {
  const { age } = req.body;
  if (!age) {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  }
  if (age < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }
  next();
};

const addTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) {
    return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  }
  next();
};

const dataCheck = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
const addTalkWatchedAt = (req, res, next) => {
  const { talk: { watchedAt } } = req.body;
  if (!watchedAt) {
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  }
  if (!dataCheck.test(watchedAt)) {
    return res.status(400).json({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  next();
  };

const addTalkRate = (req, res, next) => {
  const { talk: { rate } } = req.body;
  if (!rate) return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  if (rate < 1 || rate > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

const addTalker = async (req, res) => {
  const talkers = await readTalkers(); 
  const id = talkers.length + 1;
  const addNewTalker = { ...req.body, id };
  talkers.push(addNewTalker);
  await fs.writeFile(TALKER_JSON, JSON.stringify(talkers));
  return res.status(201).json(addNewTalker);
};

app.post('/talker', addAuthorization, addName, addAge, addTalk, addTalkWatchedAt, addTalkRate,
 addTalker,
async (req, res) => {
   res.status(201).json(addTalker); 
});
