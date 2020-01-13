import { Descriptor } from 'pip-services-commons-node';
import { CommandableHttpService } from 'pip-services-rpc-node';

export class MqttGatewayHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/mqttgateway');
        this._dependencyResolver.put('controller', new Descriptor('iqs-services-mqttgateway', 'controller', 'default', '*', '1.0'));
    }
}