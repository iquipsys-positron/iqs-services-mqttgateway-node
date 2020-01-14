import { IReferences } from 'pip-services3-commons-node';
import { ProcessContainer } from 'pip-services3-container-node';
import { DefaultRpcFactory } from 'pip-services3-rpc-node';

import { OrganizationsClientFactory } from 'pip-clients-organizations-node';
import { DevicesClientFactory } from 'iqs-clients-devices-node';
import { GatewaysClientFactory } from 'iqs-clients-gateways-node';
import { BeaconsClientFactory } from 'pip-clients-beacons-node';
import { StateUpdatesClientFactory } from 'iqs-clients-stateupdates-node';

import { MqttGatewayServiceFactory } from '../build/MqttGatewayServiceFactory';

export class MqttGatewayProcess extends ProcessContainer {

    public constructor() {
        super("mqtt-gateway", "MQTT gateway microservice");
        this._factories.add(new MqttGatewayServiceFactory());
        this._factories.add(new OrganizationsClientFactory());
        this._factories.add(new DevicesClientFactory());
        this._factories.add(new GatewaysClientFactory());
        this._factories.add(new BeaconsClientFactory());
        this._factories.add(new StateUpdatesClientFactory());
        this._factories.add(new DefaultRpcFactory);
    }

}
