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
    .option('filter', {description: 'a filter to apply to the query', alias: 'f', type: 'array'})
    .help()
    .alias('help', 'h')
    .argv

function command(argv: yargs.Arguments<yargs.InferredOptionTypes<{}>>) {
    const language: string = argv._[0] as string
    let filters: esq.Filter[] = []
    let query: string = argv.query as string
    if (argv.filter) {
        for (let filter of (argv.filter as string[])) {
            filters.push(JSON.parse(filter) as esq.Filter)
        }
    }

    if (!query || query.length === 0) {
        process.stdin.resume();
        process.stdin.on('data', function (buf) {
            query += buf.toString();
        })
        process.stdin.on('end', () => translate(query, filters, language))
    } else {
        translate(query, filters, language)
    }
}

function translate(query: string, filters: esq.Filter[], language: string) {
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
    const edsl = esq.buildEsQuery(undefined, queries, filters, opts);
    console.log(JSON.stringify(edsl));
}
