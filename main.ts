import 'https://deno.land/std@0.178.0/dotenv/load.ts'
import { parse } from 'https://deno.land/std@0.178.0/flags/mod.ts'
// import { uploadAll } from './src/upload.ts'
// import { init } from './src/init.ts'
// import { reset } from './src/reset.ts'

const flags = parse(Deno.args, {
  boolean: ['help', 'reset', 'init'],
  //   string: ["version"],
  //   default: { color: true },
})

if (flags.init) {
  const { init } = await import('./src/init.ts')
  await init()
} else if (flags.reset) {
  const { reset } = await import('./src/reset.ts')
  await reset()
} else {
  const { uploadAll } = await import('./src/upload.ts')
  await uploadAll()
}
