import * as esq from '@kbn/es-query';
import * as process from 'process';
import * as yargs from 'yargs';

yargs
    .scriptName('kedsl')
    .usage('$0 <language>')
    .command('kuery', 'Convert a Kuery to Elastic DSL', {}, command)
    .command('lucene', 'Convert a Lucene query to Elastic DSL', {}, command)
    .demandCommand(1, 1, "You need to specify a query language to translate!", "Only one query language can be specified!")
    .option('query', {description: 'the query to convert', alias: 'q', type: 'string'})
    .help()
    .alias('help', 'h')
    .argv

function command(argv : yargs.Arguments<yargs.InferredOptionTypes<{}>>) {
    const language: string = argv._[0].toString()
    let query: string = typeof argv.query === 'string' ? argv.query : typeof argv.query === 'number' ? argv.query.toString() : ''
    if (!query || query.length === 0) {
        process.stdin.resume();
        process.stdin.on('data', function (buf) {
            query += buf.toString();
        })
        process.stdin.on('end', () => translate(query, language))
    } else {
        translate(query, language)
    }
}

function translate(query: string, language: string) {
    const queries = [{query: query, language: language}];
    const opts = {
        allowLeadingWildcards: true,
        queryStringOptions: {
            analyze_wildcard: true,
            default_field: '*'
        },
        ignoreFilterIfFieldNotInIndex: false,
        dateFormatTZ: 'UTC'
    }
    const edsl = esq.buildEsQuery(undefined, queries, [], opts);
    console.log(JSON.stringify(edsl));
}
