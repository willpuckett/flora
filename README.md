<img
  src=".images/95857A84-BD02-40BE-9CD4-DA4370A192E4.webp"
  alt="A Floral Brontosaurus"
    width="200" align="right"
  style="display: inline-block; margin: 0 auto; max-width: 300px;  float: right;
 padding: 0 0 20px 20px ;">

# 🌿 🦕 Flora

Flora provides garden variety managment of your Fauna database in Deno.

> This is all very interesting you say, "but what does it do?"

Flora draws heavy inspiration from both
[fauna-gql-upload](https://github.com/Plazide/fauna-gql-upload) and
[brainyduck](https://github.com/zvictor/brainyduck), borrowing heavily from fauna-gql-upload's resource structure and brianyduck's ergonomic request builder. 

Flora provides a Deno first solution that is fast and flexible, and makes every attempt to minimize synchronous work.

<img
  src=".images/8B2A7582-F666-4ECE-BBD7-2848E0C9E47E.webp"
  alt="A Floral Dinosaur with Books"
    width="120" align="left"
  style="display: inline-block; margin: 0 auto; max-width: 300px;  float: left;
 padding: 0   20px 20px 0;">


## Installation

There is no installation required for flora. Flora will look for TypeScript assets in a subfolder of the current working directory called `flora`. If you would like to scoffold the directory structure and see example resource and schema files, you may run

```bash
deno run -A 'https://deno.land/x/flora/main.ts' --init
```

### Keys

Flora needs a key to interact with fauna. You may provide it at command time via environment variable, though many prefer to use a `.env` file. You can rename the `.env.sample` file in the project repo to `.env` and update it with an admin key for your database to get started. It should wind up looking something like

```bash
FLORA_KEY=sdalkasdnogiaegpbnasdfihj
FLORA_REGION=us
```

Available regions are `'eu' | 'us' | 'classic' | 'preview' | 'local'`.


<img
  src=".images/A878DAC2-F2EA-4770-9945-9916C58587CA.webp"
  alt="A Floral Dinosaur with Books"
    width="120" align="right"
  style="display: inline-block; margin: 0 auto; max-width: 300px;  float: right;
 padding: 0 0 20px 20px ;">


### Setting Up Your Import Map

GraphqlCodegen still uses npm style imports. Deno cannot load these without a little help. If you plan to use flora's request builder, you'll need to make sure your `import_map.json` has the following:

```ts
{
  "imports": {
    "graphql-request": "npm:graphql-request",
    "graphql-request/dist/types.dom": "npm:graphql-request/dist/types.dom",
    "graphql-tag": "https://esm.sh/graphql-tag@2.12.6"
  }
}
```

This map is in the root of the project repo for reference, or you may call it directly at runtime using Deno's `--import-map` flag.

<img
  src=".images/F1B4F507-86D9-4AE7-8E72-CFCBD334A4EF.webp"
  alt="A Floral Dinosaur with Books"
    width="120" align="left"
  style="display: inline-block; margin: 0 auto; max-width: 300px;  float: left;
 padding: 0   20px 20px 0;">


## 📖 Usage



To upload all resources and schemas, run 

```bash
deno run -A 'https://deno.land/x/flora/main.ts'
```

This will generate a `flora.ts` file inside the `flora` directory at your project root. You may 

```ts
import flora from "./flora/flora.ts"

const user = await flora({secret}).findUserById({id: 1})
```

or, for multiple queries/mutations: 

```ts
import Flora from "./flora/flora.ts"

const flora = Flora({secret})
const user = await flora.findUserById({id: 1})
const posts = await flora.posts()
```


or reference any other query or mutation you setup in your schema. With your cursor after `flora.`, use `ctrl+space` in VSCode to see a list of suggestions.

The ability to upload individual resources via command is forthcoming. Should you need to do so immediately, you may 

```ts
import {uploadAll} from 'https://deno.land/x/flora/mod.ts'

uploadAll([schemas, indexes, flowers]) 
```

Please note, if there is no directory for a type of resource in your `flora` directory, or no resource files in that directory, that resource will be skipped quietly.


## Resets

As you might imgine, resets can be accomplished with 

```bash
deno run -A 'https://deno.land/x/flora/main.ts' --reset
```

This will blow up your schema and get rid of all resources in your database. The ability to target individual resources is forthcoming! 

<img
  src=".images/7BF78088-D7E4-44B3-80B8-CA8B63A3A552.webp"
  alt="A Floral Dinosaur with Books"
  width="120" align="right"
  style="display: inline-block; margin: 0 auto; max-width: 300px;  float: right; padding: 0 0 20px 20px ;">

## Migrating

If you are migrating from fauna-gql-upload, your directory structure and names can remain exactly the same. You may want to change your resource imports from 

```ts
import { query as q } from "faunadb";
import { FunctionResource } from "fauna-gql-upload";
```

to 

```ts
import { FunctionResource, q } from "https://deno.land/x/flora/mod.ts"
```

This may not be strictly necessary depending on your import map.





