"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_rpc_node_1 = require("pip-services-rpc-node");
class MqttGatewayHttpServiceV1 extends pip_services_rpc_node_1.CommandableHttpService {
    constructor() {
        super('v1/mqttgateway');
        this._dependencyResolver.put('controller', new pip_services_commons_node_1.Descriptor('iqs-services-mqttgateway', 'controller', 'default', '*', '1.0'));
    }
}
exports.MqttGatewayHttpServiceV1 = MqttGatewayHttpServiceV1;
//# sourceMappingURL=MqttGatewayHttpServiceV1.js.map