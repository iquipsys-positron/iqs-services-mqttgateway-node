import { DependencyResolver } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';

import { CompositeLogger } from 'pip-services-components-node';
import { CompositeCounters } from 'pip-services-components-node';

import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';
import { IDevicesClientV1 } from 'iqs-clients-devices-node';
import { IGatewaysClientV1 } from 'iqs-clients-gateways-node';
import { IBeaconsClientV1 } from 'pip-clients-beacons-node';
import { IStateUpdatesClientV1 } from 'iqs-clients-stateupdates-node';

import { IMqttGatewayConnector } from '../connectors/IMqttGatewayConnector';
import { OrganizationsConnector } from './OrganizationsConnector';
import { GatewaysConnector } from './GatewaysConnector';
import { DevicesConnector } from './DevicesConnector';

import { ExternalDependencies } from './ExternalDependencies';

export class ExternalDependenciesResolver extends DependencyResolver {
    private static _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        'dependencies.connector', 'iqs-services-mqttgateway:connector:*:*:1.0',
        'dependencies.organizations', 'pip-services-organizations:client:*:*:1.0',
        'dependencies.devices', 'iqs-services-devices:client:*:*:1.0',
        'dependencies.gateways', 'iqs-services-gateways:client:*:*:1.0',
        'dependencies.beacons', 'pip-services-beacons:client:*:*:1.0',
        'dependencies.state-updates', 'iqs-services-stateupdates:client:*:*:1.0'
    );

    public constructor() {
        super(ExternalDependenciesResolver._defaultConfig);
    }

    public resolve(): ExternalDependencies {
        let dependencies = new ExternalDependencies();

        dependencies.organizationsClient = this.getOneRequired<IOrganizationsClientV1>('organizations');
        dependencies.devicesClient = this.getOneRequired<IDevicesClientV1>('devices');
        dependencies.gatewaysClient = this.getOneRequired<IGatewaysClientV1>('gateways');
        dependencies.beaconsClient = this.getOneRequired<IBeaconsClientV1>('beacons');
        dependencies.statesClient = this.getOneRequired<IStateUpdatesClientV1>('state-updates');

        dependencies.connector = this.getOneRequired<IMqttGatewayConnector>('connector');

        dependencies.organizationsConnector = new OrganizationsConnector(dependencies.logger, dependencies.organizationsClient);
        dependencies.devicesConnector = new DevicesConnector(dependencies.logger, dependencies.devicesClient);
        dependencies.gatewaysConnector = new GatewaysConnector(dependencies.logger, dependencies.gatewaysClient);
        
        return dependencies;
    }
}