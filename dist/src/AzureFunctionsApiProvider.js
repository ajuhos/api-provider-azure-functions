"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_core_1 = require("api-core");
const ApiQueryStringParser_1 = require("./ApiQueryStringParser");
class AzureFunctionsApiProvider {
    constructor(api) {
        this.processRequest = (req) => __awaiter(this, void 0, void 0, function* () {
            try {
                let request = this.defaultApi.parseRequest(Object.keys(req.params).map(p => req.params[p]));
                if (!request.path.segments.length) {
                    return {
                        status: 404,
                        body: "Not Found",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                }
                request.context = ApiQueryStringParser_1.ApiQueryStringParser.parse(req.query, request.path);
                if (req.body) {
                    request.body = req.body;
                }
                switch (req.method) {
                    case "GET":
                        request.type = api_core_1.ApiRequestType.Read;
                        break;
                    case "POST":
                        request.type = api_core_1.ApiRequestType.Create;
                        break;
                    case "PUT":
                        request.type = api_core_1.ApiRequestType.Update;
                        break;
                    case "PATCH":
                        request.type = api_core_1.ApiRequestType.Patch;
                        break;
                    case "DELETE":
                        request.type = api_core_1.ApiRequestType.Delete;
                        break;
                }
                let query = this.defaultApi.buildQuery(request);
                query.request = request;
                const resp = yield query.execute(req.user);
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (resp.metadata) {
                    if (resp.metadata.pagination) {
                        const total = resp.metadata.pagination.total || 0, limit = +req.query.limit || ApiQueryStringParser_1.ApiQueryStringParser.defaultLimit;
                        headers['X-Total-Count'] = req.query.page ? Math.ceil(total / limit) : total;
                    }
                    if (resp.metadata.contentType) {
                        headers['Content-Type'] = resp.metadata.contentType;
                    }
                    if (resp.metadata.headers) {
                        const headerNames = Object.keys(resp.metadata.headers);
                        for (let header of headerNames) {
                            headers[header] = resp.metadata.headers[header];
                        }
                    }
                }
                if (resp instanceof api_core_1.ApiEdgeQueryStreamResponse) {
                    throw new api_core_1.ApiEdgeError(500, 'Streams are not yet supported.');
                }
                else {
                    return {
                        headers,
                        body: resp.data
                    };
                }
            }
            catch (e) {
                return {
                    status: e.status,
                    body: e.message,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
        });
        this.defaultApi = api;
    }
}
exports.AzureFunctionsApiProvider = AzureFunctionsApiProvider;
//# sourceMappingURL=AzureFunctionsApiProvider.js.map