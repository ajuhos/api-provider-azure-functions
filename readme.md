# api-provider-azure-functions

API provider for building api-core based APIs consumable 
via HTTP using Azure Functions framework.

## Installation

```
npm install api-provider-azure-functions
```

## Usage
```typescript
import { AzureFunctionsApiProvider } from "api-provider-azure-functions";

const API = new Api(...);
const provider = new AzureFunctionsApiProvider(API);
      
module.exports = async function (context, req) {
    context.res = await provider.processRequest(req)
    context.done();
};
```