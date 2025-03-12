const { OpenAI } = require('openai');
const logger = require('./logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeTrend(multipliers) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: `Você é um analista especializado em jogos de crash. Analise esta sequência de multiplicadores e responda APOSTAR ou NAO_APOSTAR.
        
        Últimos 28 valores: ${multipliers.slice(-28).join('x, ')}x
        Média recente: ${calculateAverage(multipliers.slice(-10))}x
        Tendência: ${identifyTrend(multipliers.slice(-20))}
        
        Regras:
        1. Apostar se identificar padrão de alta consistente
        2. Não apostar após 5 multiplicadores > 5x consecutivos
        3. Considerar volatilidade do momento
        4. Após um valor acima de 10 probabilidade alta de vim acima de 10 novamente
        5. Após um valor acima de 30 probabilidade de ver uma sequência de varios valores abaixo de 2
        6. Observe sua ultima solicitação APOSTAR ou NAO_APOSTAR e melhore com os erros
        7. Sequência de numeros abaixo de 2 com algumas jogadas aleatóriamente acima de 2 é um momento ruim para apostas`
      }],
      temperature: 0.8,
      max_tokens: 50
    });

    const decision = response.choices[0].message.content;
    console.log("Decisão recebida:", decision);
    return decision.includes('APOSTAR') ? 1 : 0;
  } catch (error) {
    logger.error(`Erro no ChatGPT: ${error.message}`);
    return 0;
  }
}

// Funções auxiliares
function calculateAverage(values) {
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
}

function identifyTrend(values) {
  if (values.length < 2) return 'Indeterminado';
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  return last > prev ? 'Alta' : last < prev ? 'Baixa' : 'Estável';
}

module.exports = {
  predictBet: analyzeTrend
};