"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_aws_node_1 = require("pip-services-aws-node");
const MqttGatewayServiceFactory_1 = require("../build/MqttGatewayServiceFactory");
class MqttGatewayLambdaFunction extends pip_services_aws_node_1.CommandableLambdaFunction {
    constructor() {
        super("signals", "MQTT gateway function");
        this._dependencyResolver.put('controller', new pip_services_commons_node_1.Descriptor('iqs-services-signals', 'controller', 'default', '*', '*'));
        this._factories.add(new MqttGatewayServiceFactory_1.MqttGatewayServiceFactory());
    }
}
exports.MqttGatewayLambdaFunction = MqttGatewayLambdaFunction;
exports.handler = new MqttGatewayLambdaFunction().getHandler();
//# sourceMappingURL=MqttGatewayLambdaFunction.js.map