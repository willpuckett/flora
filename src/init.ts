import { decompress } from 'https://deno.land/x/zip@v1.2.5/mod.ts'
import * as path from 'https://deno.land/std@0.178.0/path/mod.ts'

export const init = async () => {
  const resp = await fetch(
    'https://deno.land/x/flora/.init.zip',
  )
  if (!resp.ok) {
    throw new Deno.errors.BadResource(
      `Request failed with status ${resp.status}`,
    )
  } else if (!resp.body) {
    throw new Deno.errors.UnexpectedEof(
      `Something went wrong, response body is empty`,
    )
  }

  // Would .pipeThrough() work here somehow?
  // .pipeThrough(new DecompressionStream("zip"))

  const zipPath = path.join(Deno.cwd(), 'flora.zip')
  const file = await Deno.open(zipPath, { createNew: true, write: true })
  console.log(zipPath, file)
  await resp.body
    .pipeTo(file.writable)
  // file.close()
  await decompress(zipPath)
  Deno.remove(zipPath)
}
