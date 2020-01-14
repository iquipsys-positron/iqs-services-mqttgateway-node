"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const OrganizationsConnector_1 = require("./OrganizationsConnector");
const GatewaysConnector_1 = require("./GatewaysConnector");
const DevicesConnector_1 = require("./DevicesConnector");
const ExternalDependencies_1 = require("./ExternalDependencies");
class ExternalDependenciesResolver extends pip_services3_commons_node_1.DependencyResolver {
    constructor() {
        super(ExternalDependenciesResolver._defaultConfig);
    }
    resolve() {
        let dependencies = new ExternalDependencies_1.ExternalDependencies();
        dependencies.organizationsClient = this.getOneRequired('organizations');
        dependencies.devicesClient = this.getOneRequired('devices');
        dependencies.gatewaysClient = this.getOneRequired('gateways');
        dependencies.beaconsClient = this.getOneRequired('beacons');
        dependencies.statesClient = this.getOneRequired('state-updates');
        dependencies.connector = this.getOneRequired('connector');
        dependencies.organizationsConnector = new OrganizationsConnector_1.OrganizationsConnector(dependencies.logger, dependencies.organizationsClient);
        dependencies.devicesConnector = new DevicesConnector_1.DevicesConnector(dependencies.logger, dependencies.devicesClient);
        dependencies.gatewaysConnector = new GatewaysConnector_1.GatewaysConnector(dependencies.logger, dependencies.gatewaysClient);
        return dependencies;
    }
}
exports.ExternalDependenciesResolver = ExternalDependenciesResolver;
ExternalDependenciesResolver._defaultConfig = pip_services3_commons_node_2.ConfigParams.fromTuples('dependencies.connector', 'iqs-services-mqttgateway:connector:*:*:1.0', 'dependencies.organizations', 'pip-services-organizations:client:*:*:1.0', 'dependencies.devices', 'iqs-services-devices:client:*:*:1.0', 'dependencies.gateways', 'iqs-services-gateways:client:*:*:1.0', 'dependencies.beacons', 'pip-services-beacons:client:*:*:1.0', 'dependencies.state-updates', 'iqs-services-stateupdates:client:*:*:1.0');
//# sourceMappingURL=ExternalDependenciesResolver.js.map