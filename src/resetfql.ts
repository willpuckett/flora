import { q } from './util.ts'
// Delete all Collections
export const collections = q.Foreach(
  q.Paginate(q.Collections(), { size: 100000 }),
  q.Lambda('ref', q.Delete(q.Var('ref'))),
)

// Delete all Databases
export const databases = q.Map(
  q.Paginate(q.Databases(), { size: 100000 }),
  q.Lambda((db) => q.Delete(db)),
)

// Delete all Documents
export const documents = q.Map(
  q.Paginate(q.Collections(), { size: 100000 }),
  q.Lambda((col) =>
    q.Map(
      q.Paginate(q.Documents(col), { size: 100000 }),
      q.Lambda((doc) => q.Delete(doc)),
    )
  ),
)

// Delete all Functions
export const functions = q.Foreach(
  q.Paginate(q.Functions(), { size: 100000 }),
  q.Lambda('ref', q.Delete(q.Var('ref'))),
)

// Delete all Indexes
export const indexes = q.Foreach(
  q.Paginate(q.Indexes(), { size: 100000 }),
  q.Lambda('ref', q.Delete(q.Var('ref'))),
)

// Delete all Roles
export const roles = q.Foreach(
  q.Paginate(q.Roles(), { size: 100000 }),
  q.Lambda('ref', q.Delete(q.Var('ref'))),
)

// Deal with GQL metadata
export const schemas = q.Do(
  // Remove GraphQL metadata from Collections
  q.Foreach(
    q.Paginate(q.Collections(), { size: 100000 }),
    q.Lambda(
      'ref',
      q.Update(q.Var('ref'), {
        'data': {
          'gql': null,
        },
      }),
    ),
  ),
  // Remove GraphQL metadata from Functions
  q.Foreach(
    q.Paginate(q.Functions(), { size: 100000 }),
    q.Lambda(
      'ref',
      q.Update(q.Var('ref'), {
        'data': {
          'gql': null,
        },
      }),
    ),
  ),
  // Remove GraphQL metadata from Indexes
  q.Foreach(
    q.Paginate(q.Indexes(), { size: 100000 }),
    q.Lambda(
      'ref',
      q.Update(q.Var('ref'), {
        'data': {
          'gql': null,
        },
      }),
    ),
  ),
)
