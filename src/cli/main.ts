import type { Model } from '../language/generated/ast.js';
import { Command } from 'commander';
import { MadeLanguageMetaData } from '../language/generated/module.js';
import { createMadeServices } from '../language/made-module.js';
import { extractAstNode } from './cli-util.js';
import { generate } from './generator.js';
import { NodeFileSystem } from 'langium/node';

//import * as url from 'node:url';
//import * as fs from 'node:fs/promises';
//import * as path from 'node:path';

//const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
//const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createMadeServices(NodeFileSystem).Made;
    const model = await extractAstNode<Model>(fileName, services);
    generate(model, fileName, opts.destination, opts);

};

export type GenerateOptions = {
    destination?: string,
    only_synchronize_from_made_to_projectManagement?: boolean,
    only_synchronize_from_projectManagement_to_made?: boolean,
    only_project_documentation?: boolean,
    all?: boolean,
}

export default function(): void {
    const program = new Command();

    // program.version(require('../../package.json').version);


    const fileExtensions = MadeLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('Generate Files')
        .action(generateAction);

    program.parse(process.argv);
}
