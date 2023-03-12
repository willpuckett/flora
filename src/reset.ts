import { TerminalSpinner } from 'https://deno.land/x/spinners@v1.1.2/mod.ts'
import chalk from 'npm:chalk@5.2.0'
import { client } from './util.ts'
import * as resets from './resetfql.ts'
import { uploadSchema } from './schema.ts'

const ALL_TYPES = {
  functions: true,
  indexes: true,
  roles: true,
  documents: true,
  collections: true,
  databases: true,
  schemas: true,
}

const confirmReset = async (types = ALL_TYPES) => {
  const listOfTypes = chalk.red.bold(Object.keys(types).join(', '))

  const answer = await confirm(
    `You are about to wipe out all the ${listOfTypes} from the database associated to the key you provided.\nThis action is irreversible and might possibly affect production data.\nAre you sure you want to delete all the ${listOfTypes}?`,
  )
  return answer
}

const resetResource = async (type: string) => {
  const spinner = new TerminalSpinner(
    `Resetting ${type}...`,
  )
  spinner.start()

  try {
    const data = await client.query(resets[type as keyof typeof resets])

    if (!data) {
      return spinner.fail(`No data was deleted of type '${type}'`)
    }

    spinner.succeed(`${type} cleared out`)
    console.log('deleted:')
    console.dir(data)

    return data
  } catch (e) {
    spinner.fail(`${type} reset failed`)
    throw e
  }
}

export async function reset(types = ALL_TYPES) {
  const _types = Object.keys(types).filter((key) =>
    types[key as keyof typeof types]
  )
  const confirmation = await confirmReset(types)
  if (!confirmation) {
    console.log('No problem. Aborting reset. There\'s always next time.')
    return
  }
  if (types.schemas) {
    const spinner = new TerminalSpinner()
    spinner.start()

    try {
      await uploadSchema({ mode: 'reset' })
      spinner.succeed(`Graphql schema has been reset.`)
    } catch (e) {
      spinner.fail()
      throw e
    }
  }

  for (const type of _types) {
    resetResource(type)
  }
}
