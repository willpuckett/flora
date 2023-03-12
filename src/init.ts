import { decompress } from 'https://deno.land/x/zip@v1.2.5/mod.ts'

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

  const file = await Deno.open('.init.zip', { truncate: true, write: true })
  await resp.body
    // Would .pipeThrough() work here somehow?
    // .pipeThrough(new DecompressionStream("zip"))
    .pipeTo(file.writable)
  file.close()
  await decompress('.init.zip')
  Deno.remove('.init.zip')
}
