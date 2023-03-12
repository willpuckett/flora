import faunadb from 'https://esm.sh/faunadb@4.8.0'
import _debug from 'npm:debug@4.3.4'
import figures from 'npm:figures@5.0.0'
import * as path from 'https://deno.land/std@0.178.0/path/mod.ts'

export type faunaQueryFunction = (params: faunadb.ExprArg) => faunadb.Expr

export const { query: q } = faunadb

interface Endpoint {
  graphql: string
  api: string
}
type Region = 'eu' | 'us' | 'classic' | 'preview' | 'local'
const regionMap = new Map<Region, Endpoint>([
  ['eu', {
    graphql: 'https://graphql.eu.fauna.com',
    api: 'https://db.eu.fauna.com',
  }],
  ['us', {
    graphql: 'https://graphql.us.fauna.com',
    api: 'https://db.us.fauna.com',
  }],
  ['classic', {
    graphql: 'https://graphql.fauna.com',
    api: 'https://db.fauna.com',
  }],
  ['preview', {
    graphql: 'https://graphql.fauna-preview.com',
    api: 'https://db.fauna-preview.com',
  }],
  ['local', {
    graphql: 'http://localhost:8084',
    api: 'http://localhost:8443',
  }],
])

export const getEndpoint = () =>
  regionMap.get(Deno.env.get('FLORA_REGION') as Region || 'classic')!

const debug = _debug('flora:util')

export const client = new faunadb.Client({
  secret: Deno.env.get('FLORA_KEY')!,
  domain: (new URL (getEndpoint().api)).hostname,
  port: +(new URL (getEndpoint().api)).port,
})

export const walk = async (dir: string) => {
  debug(`Looking for files in directory "${dir}"`)
  const files: string[] = []
  const resourceDir = path.join(Deno.cwd(), 'flora', dir)
  try {
    for await (const dirEntry of Deno.readDir(resourceDir)) {
      if (dirEntry.isFile) {
        const file = path.join(resourceDir, dirEntry.name)
        files.push(file)
        debug(`\t${figures.pointer} found ${dirEntry.name}`)
      }
    }
  } catch (err) {
    debug(`\t${figures.pointer} error: ${err}`)
  }
  return files
}
