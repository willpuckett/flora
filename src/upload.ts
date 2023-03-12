import { TerminalSpinner } from 'https://deno.land/x/spinners@v1.1.2/mod.ts'
import { uploadResource } from './resource.ts'
import {ResourceType} from '../mod.ts'
// import { uploadSchema } from './schema.ts'
// import { flower } from './flower.ts'

export type Uploadables = ResourceType | "flowers" | "schemas"

export const uploadAll = async (
  resources: Uploadables[]= [
    'schemas',
    'indexes',
    'flowers',
    'functions',
    'roles',
    'providers',
    // 'data'
  ],
) => {
  const ops = new Set(resources)

  if (ops.delete('schemas')) {
    await uploadGroup(new Set(['schemas']))
  }
  if (ops.delete('indexes')) {
    await uploadGroup(new Set(['indexes']))
  }
  await uploadGroup(ops)
}

const uploadGroup = (resources: Set<string>) => {
  const promises: Promise<void>[] = []
  for (const resource of resources.values()) {
    promises.push(upload(resource))
  }
  return Promise.all(promises)
}

const upload = async (resource: string) => {
  const spinner = new TerminalSpinner(
    `Working on ${resource}...`,
  )
  spinner.start()
  try {
    if (resource === 'flowers') {
      const {flower} = await import('./flower.ts')
      await flower()
    } else if (resource === 'schemas') {
      const {uploadSchema} = await import('./schema.ts')
      await uploadSchema()
    } else {
      await uploadResource(resource)
    }
    spinner.succeed(`${resource} complete.`)
  } catch (error) {
    spinner.fail(`${resource} failed.`)
    console.error(error)
  }
}
