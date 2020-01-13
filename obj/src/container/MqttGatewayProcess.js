"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_container_node_1 = require("pip-services-container-node");
const pip_services_rpc_node_1 = require("pip-services-rpc-node");
const pip_clients_organizations_node_1 = require("pip-clients-organizations-node");
const iqs_clients_devices_node_1 = require("iqs-clients-devices-node");
const iqs_clients_gateways_node_1 = require("iqs-clients-gateways-node");
const pip_clients_beacons_node_1 = require("pip-clients-beacons-node");
const iqs_clients_stateupdates_node_1 = require("iqs-clients-stateupdates-node");
const MqttGatewayServiceFactory_1 = require("../build/MqttGatewayServiceFactory");
class MqttGatewayProcess extends pip_services_container_node_1.ProcessContainer {
    constructor() {
        super("mqtt-gateway", "MQTT gateway microservice");
        this._factories.add(new MqttGatewayServiceFactory_1.MqttGatewayServiceFactory());
        this._factories.add(new pip_clients_organizations_node_1.OrganizationsClientFactory());
        this._factories.add(new iqs_clients_devices_node_1.DevicesClientFactory());
        this._factories.add(new iqs_clients_gateways_node_1.GatewaysClientFactory());
        this._factories.add(new pip_clients_beacons_node_1.BeaconsClientFactory());
        this._factories.add(new iqs_clients_stateupdates_node_1.StateUpdatesClientFactory());
        this._factories.add(new pip_services_rpc_node_1.DefaultRpcFactory);
    }
}
exports.MqttGatewayProcess = MqttGatewayProcess;
//# sourceMappingURL=MqttGatewayProcess.js.map