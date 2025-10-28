import * as http from 'node:http'
import {Command} from 'commander'
const program = new Command();
program
    .option('-i, --input <path>')
    .requiredOption('-h, --host <type>')
    .requiredOption('-p, --port <type>');
program.parse(process.argv); // рrocess.argv - властивість, що повертає список аргументів
const options = program.opts();
if (!options.input){ // Перевірка наявності опції input
    console.error('Cannot find input file');
    process.exit();
}

let port = options.port;
let host = options.host;

const server = http.createServer((req, res) => {
    res.writeHead(200, {'content-type':'text/plain'})
});
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});