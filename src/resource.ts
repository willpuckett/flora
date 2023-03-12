import _debug from 'npm:debug@4.3.4'
import { TerminalSpinner } from 'https://deno.land/x/spinners@v1.1.2/mod.ts'
import { isEqual } from 'npm:lodash-es@4.17.21'
import { toFileUrl } from 'https://deno.land/std@0.178.0/path/mod.ts'
import { client, walk, faunaQueryFunction, q } from './util.ts'
import {createOrUpdateData} from './data.ts'
import {
  IndexResource,
  StandardResource,
  StandardResourceType,
} from 'npm:fauna-gql-upload/types.ts'
// import logSymbols from 'npm:log-symbols@5.1.0'

const resources = new Map<
  StandardResourceType,
  {
    create: faunaQueryFunction
    identity: faunaQueryFunction
  }
>([
  ['indexes', { create: q.CreateIndex, identity: q.Index }],
  ['functions', {
    create: q.CreateFunction,
    identity: q.Function,
  }],
  ['roles', { create: q.CreateRole, identity: q.Role }],
  ['data', { create: q.Abort, identity: q.Abort }],
  ['providers', {
    create: q.CreateAccessProvider,
    identity: q.AccessProvider,
  }],
])

export async function uploadResource(resource: StandardResourceType) {
  const debug = _debug(`flora:upload-${resource}`)
  const { create, identity } = resources.get(resource)!
  const files = (await walk(resource)).filter((file) => file.endsWith('.ts'))
  debug(`Found ${files.length} ${resource} files.`)
  debug(files)

  // Define the function for a single resource upload...
  const uploadResourceFile = async (file: string) => {
    const { default: resourceModule }: { default: StandardResource } =
      await import(toFileUrl(file).href)
       if (resource === 'data') {
      return createOrUpdateData(resourceModule)
    }
    let replacing: boolean = await client.query(
      q.Exists(identity(resourceModule.name)),
    )
    debug(
      `${
        replacing ? 'Updating' : 'Creating'
      } ${resource} '${resourceModule.name}' from file ${file}:`,
    )

    // Indexes are a special case because they cannot be updated
    if (resource === 'indexes' && replacing) {
      const index = await client.query<IndexResource>(
        q.Get(identity(resourceModule.name)),
      )
      // This isn't perfect, but it saves a bucket of time if the index is likely unchanged
      // checks for identical source collection names and
      // deep equality in terms & values fields
      if (
        index.source.value.id === resourceModule.source.raw.collection &&
        isEqual(index.terms, resourceModule.terms) &&
        isEqual(index.values, resourceModule.values)
      ) {
        return {
          status:
            `index ${resourceModule.name} already exists and is (likely) identical.`,
          advice:
            `If that's not the case, delete it in fauna dashboard and re-run flora.`,
        }
      }
      await client.query(q.Delete(identity(resourceModule.name)))
      const spinner = new TerminalSpinner(
        'This is gonna take like literally a minute...',
      )
      spinner.start()
      await new Promise((resolve) => setTimeout(resolve, 60000))
      spinner.succeed('Index sync complete.')
      // Index nolonger exists, so we need to use the create command in the next step
      replacing = false
    } 
    const query = replacing
      ? q.Update(identity(resourceModule.name), resourceModule)
      : create(resourceModule)
    const data = client.query(query)
    debug(
      `✓ ${resource} has been created/updated: ${resourceModule.name}`,
    )
    return data
  }

  // ...and then run it on all the files in the resource directory
  return await Promise.all(
    files.map((file) => uploadResourceFile(file)),
  )
}
