import _debug from 'npm:debug@4.3.4'
import { print } from 'npm:graphql@16.6.0'
import { loadTypedefs, OPERATION_KINDS } from 'npm:@graphql-tools/load@7.8.13'
import { UrlLoader } from 'npm:@graphql-tools/url-loader@7.17.14'
import { mergeTypeDefs } from 'npm:@graphql-tools/merge@8.4.0'
import { getEndpoint } from './util.ts'

const debug = _debug('flora:introspect')

const options = {
  loaders: [new UrlLoader()],
  filterKinds: OPERATION_KINDS,
  sort: false,
  forceGraphQLImport: true,
  useSchemaDefinition: false,
  headers: {
    Authorization: `Bearer ${Deno.env.get('FLORA_KEY')}`,
  },
}

const pullSchema = async (url: string) => {
  debug(`Pulling the schema from '${url}'`)
  const typeDefs = await loadTypedefs(url, options).catch((err) => {
    if (
      err.message.includes(
        'Must provide schema definition with query type or a type named Query.',
      )
    ) {
      console.warn(
        `Please make sure you have pushed a valid schema before trying to pull it back.`,
      )
      throw new Error(`Invalid schema retrieved: missing type Query`)
    }

    throw err
  })
  debug(`${typeDefs.length} typeDef(s) found`)

  if (!typeDefs || !typeDefs.length) {
    throw new Error('no schema found')
  }

  const mergedDocuments = print(
    mergeTypeDefs(
      typeDefs.map((r) => r.document!),
      options,
    ),
  )

  return typeof mergedDocuments === 'string'
    ? mergedDocuments
    : mergedDocuments && print(mergedDocuments)
}

export async function introspect(outputPath?: string) {
  debug(`called with:`, { outputPath })
  const t0 = performance.now()
  const schema = await pullSchema(`${getEndpoint().graphql}/graphql`)
  debug(`The call to fauna took ${performance.now() - t0} milliseconds.`)

  if (outputPath) {
    await Deno.writeTextFile(outputPath, schema)
    debug(`The schema has been stored at '${outputPath}'`)
  }

  return schema
}
