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