import {ApiEdgeError, ApiEdgeQueryStreamResponse, Api, ApiRequestType} from "api-core";
import {ApiQueryStringParser} from "./ApiQueryStringParser";

export interface AzureFunctionsRequest {
    query: any
    params: any
    body: any
    method: string,
    user: any
}

export class AzureFunctionsApiProvider {
    defaultApi: Api;
    constructor(api: Api) {
        this.defaultApi = api;
    }

    processRequest = async (req: AzureFunctionsRequest) => {
        //TODO: Support versions

        try {
            let request = this.defaultApi.parseRequest(
                Object.keys(req.params).map(p => req.params[p])
            );

            if(!request.path.segments.length) {
                return {
                    status: 404,
                    body: "Not Found",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            }

            request.context = ApiQueryStringParser.parse(req.query, request.path);

            if (req.body) {
                request.body = req.body;
            }

            //TODO: Add support for streams

            switch(req.method) {
                case "GET":
                    request.type = ApiRequestType.Read;
                    break;
                case "POST":
                    request.type = ApiRequestType.Create;
                    break;
                case "PUT":
                    request.type = ApiRequestType.Update;
                    break;
                case "PATCH":
                    request.type = ApiRequestType.Patch;
                    break;
                case "DELETE":
                    request.type = ApiRequestType.Delete;
                    break;
            }

            let query = this.defaultApi.buildQuery(request);
            query.request = request;

            //TODO: req.user - Is this an acceptable solution?
            const resp = await query.execute(req.user);

            const headers: any = {
                'Content-Type': 'application/json'
            };

            if(resp.metadata) {
                if(resp.metadata.pagination) {
                    const total = resp.metadata.pagination.total || 0,
                        limit = +req.query.limit || ApiQueryStringParser.defaultLimit;
                    headers['X-Total-Count'] = req.query.page ? Math.ceil(total / limit) : total;
                }

                if(resp.metadata.contentType) {
                    headers['Content-Type'] = resp.metadata.contentType
                }

                if(resp.metadata.headers) {
                    const headerNames = Object.keys(resp.metadata.headers);
                    for(let header of headerNames) {
                        headers[header] = resp.metadata.headers[header]
                    }
                }
            }

            if(resp instanceof ApiEdgeQueryStreamResponse) {
                //TODO: add support for streams
                throw new ApiEdgeError(500, 'Streams are not yet supported.')
            }
            else {
                return {
                    headers,
                    body: resp.data
                }
            }
        }
        catch (e) {
            return {
                status: e.status,
                body: e.message,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
    }
}