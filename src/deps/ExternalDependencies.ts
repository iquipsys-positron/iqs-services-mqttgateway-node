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

export class ExternalDependencies {
    public logger: CompositeLogger;
    public counters: CompositeCounters;
    
    public statesClient: IStateUpdatesClientV1;
    public devicesClient: IDevicesClientV1;
    public gatewaysClient: IGatewaysClientV1;
    public beaconsClient: IBeaconsClientV1;
    public organizationsClient: IOrganizationsClientV1;

    public connector: IMqttGatewayConnector;
    public organizationsConnector: OrganizationsConnector;
    public gatewaysConnector: GatewaysConnector;
    public devicesConnector: DevicesConnector;
}