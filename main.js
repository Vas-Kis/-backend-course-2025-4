import * as http from 'node:http'
import { readFile, writeFile } from 'node:fs'
import { Command } from 'commander'
import { XMLBuilder } from 'fast-xml-parser';
const program = new Command();
program
    .option('-i, --input <path>')
    .option('-h, --host <type>')
    .option('-p, --port <type>');
program.parse(process.argv); // рrocess.argv - властивість, що повертає список аргументів
const { input, host, port } = program.opts();
if (!input) {
  console.error('Cannot find input file');
  process.exit();
}
if (!host) {
  console.error('host missing (type `--help` for more info)');
  process.exit();
}
if (!port) {
  console.error('port missing (type `--help` for more info)');
  process.exit();
}
// Створення сервера
const server = http.createServer((req, res) => { //Створення сервера, що приймає функцію-обробник (req, res)
    const url = new URL(req.url, `http://${host}:${port}`);
    const furnished = url.searchParams.get('furnished') === 'true';
    const maxPrice = url.searchParams.get('max_price');

    readFile(input, 'utf-8', (err, data) => {

    // Перетворення JSON Lines → масив об'єктів
    const lines = data.split('\n').filter(line => line.trim() !== '');
    let houses = lines.map(line => JSON.parse(line));

    //Фільтрація запиту

    let filtered = houses;
    if (furnished) {
      filtered = filtered.filter(
        (h) => h.furnishingstatus && h.furnishingstatus.toLowerCase() === 'furnished'
      );
    }
    if (maxPrice !== null) {
      filtered = filtered.filter(
        (h) => h.price && parseFloat(h.price) < maxPrice
      );
    }

    //Формування XML-відповіді

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true,
    });

    const xmlData = {
      houses: {
        house: filtered.map((h) => ({
          price: h.price,
          area: h.area,
          furnishingstatus: h.furnishingstatus,
        })),
      },
    };

    const xml = builder.build(xmlData);

    //Повернення відповіді

    res.writeHead(200, {'Content-Type': 'text/xml; charset=utf-8' });
    res.end(xml);
    });
});
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});