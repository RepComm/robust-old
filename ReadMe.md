# ts-map-babel-template

A template setup for:
- TypeScript ( using [babel](https://github.com/babel/babel) )
- import maps ( including [this polyfill](https://github.com/guybedford/es-module-shims) )
- And also optionally [show-casing exponent-ts](https://github.com/RepComm/exponent-ts)

## Function

Compile /src directory with:
`npm run build`
<br/>
File copy is set up as well for:
`src/index.ts` -> `./index.js`<br/>
`src/index.html` -> `./index.html`

Output is in the same directory as package.json for sake of import maps

I regularly use this for starting new projects of my own, and therefor it should stay somewhat up-to-date.
