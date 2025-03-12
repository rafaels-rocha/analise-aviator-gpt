const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const config = require('./config');
const db = require('./db');
const model = require('./model');
const logger = require('./logger');

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function initializeBrowser() {
  return puppeteer.launch({
    headless: false,
    slowMo: 30,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--disable-web-security',
      '--start-maximized',
      '--disable-infobars'
    ],
    defaultViewport: null,
  });
}

async function login(page) {
  try {
    await page.goto('https://www.aposta1.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('#signInName', { visible: true, timeout: 15000 });
    await page.type('#signInName', config.aposta1.username, { delay: 30 });
    await page.type('#password', config.aposta1.password, { delay: 30 });
    await delay(3000);
    await Promise.all([
      page.click('#next'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
    ]);
    logger.info('Login realizado com sucesso!');
    await delay(3000);
  } catch (error) {
    logger.error(`Falha no login: ${error.message}`);
    throw error;
  }
}

async function extractMultiplier() {
  return new Promise((resolve, reject) => {
   
    exec(`python src/capture_and_extract.py 387 147 87 30`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Erro ao executar o script Python: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        logger.error(`Erro no script Python: ${stderr}`);
        return reject(stderr);
      }
      const multiplierString = stdout.trim();
      const multiplier = parseFloat(multiplierString.replace('x', '').trim());
      resolve(multiplier);
    });
  });
}

async function monitorGame(page) {
  let lastMultiplier = null;
  const multiplierHistory = [];
  while (true) {
    try {
      await page.screenshot({ path: 'screenshot.png' });
      const extractedMultiplier = await extractMultiplier();
      await delay(1000);
      if (!isNaN(extractedMultiplier)&& extractedMultiplier !== lastMultiplier) {
        lastMultiplier = extractedMultiplier;
        multiplierHistory.unshift(lastMultiplier);
        logger.info(`Multiplicador detectado: ${lastMultiplier}x`);
        await db.saveMultiplier(lastMultiplier);
        if (multiplierHistory.length == 28){
          // logger.info(`${multiplierHistory.slice}`);
        const decision = await model.predictBet(multiplierHistory);
        const result = lastMultiplier >= 2.0 ? 1 : 0;
        await db.saveBet(lastMultiplier, decision, result);
        multiplierHistory.pop();
        }
        // logger.info(`Decisão: ${decision ? 'APOSTAR' : 'NÃO APOSTAR'} | Resultado: ${result ? 'GANHO' : 'PERDA'}`);
      }
    } catch (error) {
      logger.error(`Erro ao monitorar jogo: ${error.message}`);
    }
    // await delay(2000);
  }
}

async function scrapeAviator() {
  let browser;
  try {
    browser = await initializeBrowser();
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setRequestInterception(true);
    page.on('request', req => ([].includes(req.resourceType()) ? req.abort() : req.continue()));
    await login(page);
    logger.info('Navegando para o jogo...');
    await page.goto('https://www.aposta1.com/games/jogar/aviator', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(30000);
    await monitorGame(page);
  } catch (error) {
    logger.error(`Erro fatal: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      logger.info('Navegador fechado');
    }
  }
}

module.exports = { scrapeAviator };