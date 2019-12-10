"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const signalr_1 = require("@microsoft/signalr");
class ATDDMiddleware {
    constructor() {
    }
    init(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this._connection = new signalr_1.HubConnectionBuilder()
                .withUrl(`${url}/alhub`)
                .configureLogging(signalr_1.LogLevel.Debug)
                .build();
            yield this.connect();
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._connection.start();
                console.log("connected");
                return true;
            }
            catch (e) {
                console.log('connection failed', e);
                return false;
            }
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if ([signalr_1.HubConnectionState.Disconnected, signalr_1.HubConnectionState.Disconnecting].indexOf(this._connection.state) != -1)
                return;
            yield this._connection.stop();
        });
    }
    getProjects(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            this._connection.on('GetProjects', (msg) => {
                console.log(msg);
            });
            yield this._connection.invoke('QueryProjects', msg);
        });
    }
}
exports.ATDDMiddleware = ATDDMiddleware;
//# sourceMappingURL=middleware.js.map