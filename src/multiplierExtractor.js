// const { exec } = require('child_process');
// const path = require('path');
// const logger = require('./logger');

// module.exports.extractMultiplier = async (x, y, width, height) => {
//     return new Promise((resolve) => {
//         const scriptPath = path.resolve(__dirname, 'capture_and_extract.py');
//         const command = `python "${scriptPath}" ${x} ${y} ${width} ${height}`;

//         exec(command, (error, stdout) => {
//             if (error) {
//                 logger.error('OCR Error:', error);
//                 return resolve(null);
//             }

//             const result = stdout.toString().trim();
//             const number = parseFloat(result);

//             if (!isNaN(number) && number > 0) {
//                 logger.info(`Valor detectado: ${number}x`);
//                 resolve(number);
//             } else {
//                 logger.warn(`Valor inválido: ${result}`);
//                 resolve(null);
//             }
//         });
//     });
// };