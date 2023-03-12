import _debug from 'npm:debug@4.3.4'
import { TerminalSpinner } from 'https://deno.land/x/spinners@v1.1.2/mod.ts'
import { walk, getEndpoint } from './util.ts'

const debug = _debug(`flora:schema`)

interface SchemaOptions {
  mode?: 'merge' | 'override' | 'replace' | 'reset'
  override?: boolean
}

async function buildSchema() {
  debug('Concatenating schema files...', 'info')

  const files = (await walk('schema')).filter((file) =>
    file.endsWith('.graphql') || file.endsWith('.gql')
  )

  if (files.length === 0) {
    debug(
      `No GraphQL schema files found in directory. Do you have files in ./flora/schemas that end in '.gql' or '.graphql'?`,
      'error',
    )
    return null
  }

  const schemaParts = await Promise.all(
    files.map((file) => Deno.readTextFile(file)),
  )

  return schemaParts.join('\n')
}

export const uploadSchema = async (options?: SchemaOptions) => {
  const { graphql } = await getEndpoint()!
  let mode = options?.mode ?? 'merge'

  const schema = mode === 'reset'
    ? `enum flora { RESETTING }`
    : await buildSchema()
  if (mode === 'reset') {
    mode = 'override'
  }

  if (mode === 'override') {
    const shouldOverride = confirm(
      '\nJust to be clear... Overriding a schema will delete all collections, indexes, and documents. Are you sure you want to continue?',
    )
    if (!shouldOverride) {
      return
    }
    debug('Overriding schema... ')
  }

  const spinner = new TerminalSpinner(
    mode === 'override'
      ? 'Okay, this is literally going to take a minute. Go eat a 🥕...'
      : 'Uploading schema...',
  )
  spinner.start()

  const endpoint = `${graphql}/import?mode=${mode}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('FLORA_KEY')}`,
      'Content-Type': 'text/plain',
    },
    body: schema,
  })
  const result = await res.text()

  if (mode === 'override') {
    debug('Waiting a minute before uploading resources. Ugh. 😩')
    await new Promise((resolve) => setTimeout(resolve, 60000))
  }

  res.ok ? debug('updated schema', 'success') : debug(result, 'error')
  res.ok ? spinner.succeed('updated schema') : spinner.fail(result)
  if (res.ok) return schema
  else throw new Error(result)
}
