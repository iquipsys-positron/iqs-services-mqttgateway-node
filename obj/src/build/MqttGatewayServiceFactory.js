"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const MqttGatewayConnector_1 = require("../connectors/MqttGatewayConnector");
const MqttGatewayController_1 = require("../logic/MqttGatewayController");
const MqttGatewayHttpServiceV1_1 = require("../services/version1/MqttGatewayHttpServiceV1");
class MqttGatewayServiceFactory extends pip_services3_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(MqttGatewayServiceFactory.ConnectorDescriptor, MqttGatewayConnector_1.MqttGatewayConnector);
        this.registerAsType(MqttGatewayServiceFactory.ControllerDescriptor, MqttGatewayController_1.MqttGatewayController);
        this.registerAsType(MqttGatewayServiceFactory.HttpServiceDescriptor, MqttGatewayHttpServiceV1_1.MqttGatewayHttpServiceV1);
    }
}
exports.MqttGatewayServiceFactory = MqttGatewayServiceFactory;
MqttGatewayServiceFactory.Descriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-mqttgateway", "factory", "default", "default", "1.0");
MqttGatewayServiceFactory.ConnectorDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-mqttgateway", "connector", "default", "*", "1.0");
MqttGatewayServiceFactory.ControllerDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-mqttgateway", "controller", "default", "*", "1.0");
MqttGatewayServiceFactory.HttpServiceDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-mqttgateway", "service", "http", "*", "1.0");
//# sourceMappingURL=MqttGatewayServiceFactory.js.map