import { Api } from "api-core";
export interface AzureFunctionsRequest {
    query: any;
    params: any;
    body: any;
    method: string;
    user: any;
}
export declare class AzureFunctionsApiProvider {
    defaultApi: Api;
    constructor(api: Api);
    processRequest: (req: AzureFunctionsRequest) => Promise<{
        headers: any;
        body: any;
    }>;
}
