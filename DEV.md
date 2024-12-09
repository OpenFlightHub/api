# Development

## OpenApi spec
Can be edited with swagger editor (clone and run locally https://github.com/swagger-api/swagger-editor/ or https://editor-next.swagger.io/).
Following custom rules apply (because of depending build scripts):
- each path operation must have a single tag
- every request body should be a `$ref` to `components/schemas` because we can then automatically generate the JSON Schema and use that in our `api` code

## Types and Schemas
Types and schemas are automatically generated from the `database/schema.dbml` and `api/openapi_spec`
To generate them in VS Code press `F1` select `Run Tasks` and run `Generate Types and Schemas`
internal typescript types can be found in `src/definitions/DBTypes.ts`
public typescript types and JSON Schemas can be found in `src/definitions/ApiTypes.ts` and `src/definitions/ApiSchemas.ts`

## Guarding system

both express Request and Response have a property `GM` which is the GuardedMiddleware. it provides a set of functions that help you validating user input and api putput. If something is not right, those functions will throw a GuardError which will later be handled by the apps error handler. This helps you writing safe and simple code for routers.

### Following order shall be respected (so generic tests work)

2. `await guardUserIsAuthenticated()` or `await guardUserPermission()` (`guardUserPermission()` includes `guardUserIsAuthenticated()`)
3. other guards
5. `res.guardSend({someResult: 66})` or `res.send()`

## Translation
Generate translation keys automatically from sources. Missing keys will be added to each `{{lang}}.json` file
`node findTranslationKeysInSource.js`

# Testing

to test in VSCode, just press `Ctrl+Shift+T`

## Jest Documentation

https://jestjs.io/docs/getting-started#using-typescript

## SuperTest Documentation

https://www.npmjs.com/package/supertest