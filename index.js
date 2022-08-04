const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

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