const mysql = require('mysql2/promise');
const config = require('./config');
const logger = require('./logger');

let connection;

async function connect() {
  try {
    connection = await mysql.createConnection(config.db);
    logger.info('Connected to database');
  } catch (error) {
    logger.error('Error connecting to database:', error);
    throw error;
  }
}

async function saveMultiplier(multiplier) {
  try {
    const query = 'INSERT INTO multiplicadores (multiplicador) VALUES (?)';
    await connection.execute(query, [multiplier]);
    // logger.info(`Saved multiplier: ${multiplier}`);
  } catch (error) {
    logger.error('Error saving multiplier:', error);
    throw error;
  }
}

async function saveBet(multiplier, bet, result) {
  try {
    const query = 'INSERT INTO apostas (multiplicador, aposta, resultado) VALUES (?, ?, ?)';
    await connection.execute(query, [multiplier, bet, result]);
    logger.info(`Saved bet: multiplier=${multiplier}, bet=${bet}, result=${result}`);
  } catch (error) {
    logger.error('Error saving bet:', error);
    throw error;
  }
}

async function loadTrainingData() {
  try {
    const [rows] = await connection.execute('SELECT multiplicador, aposta FROM apostas');
    const data = rows.map(row => [parseFloat(row.multiplicador)]);
    const labels = rows.map(row => [parseInt(row.aposta)]);
    return { data, labels };
  } catch (error) {
    logger.error('Error loading training data:', error);
    throw error;
  }
}
async function loadTestData() {
  try {
    const [rows] = await connection.execute('SELECT multiplicador, aposta FROM apostas'); // Ou outra tabela que você usa para teste
    const data = rows.map(row => [parseFloat(row.multiplicador)]);
    const labels = rows.map(row => [parseInt(row.aposta)]);
    return { data, labels };
  } catch (error) {
    logger.error('Error loading test data:', error);
    throw error;
  }
}

module.exports = {
  connect,
  saveMultiplier,
  saveBet,
  loadTrainingData,
  loadTestData,
};