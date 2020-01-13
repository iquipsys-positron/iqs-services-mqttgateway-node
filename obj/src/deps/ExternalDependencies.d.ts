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
export declare class ExternalDependencies {
    logger: CompositeLogger;
    counters: CompositeCounters;
    statesClient: IStateUpdatesClientV1;
    devicesClient: IDevicesClientV1;
    gatewaysClient: IGatewaysClientV1;
    beaconsClient: IBeaconsClientV1;
    organizationsClient: IOrganizationsClientV1;
    connector: IMqttGatewayConnector;
    organizationsConnector: OrganizationsConnector;
    gatewaysConnector: GatewaysConnector;
    devicesConnector: DevicesConnector;
}
