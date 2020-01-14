import { Descriptor } from 'pip-services3-commons-node';
import { CommandableLambdaFunction } from 'pip-services3-aws-node';
import { MqttGatewayServiceFactory } from '../build/MqttGatewayServiceFactory';

export class MqttGatewayLambdaFunction extends CommandableLambdaFunction {
    public constructor() {
        super("signals", "MQTT gateway function");
        this._dependencyResolver.put('controller', new Descriptor('iqs-services-signals', 'controller', 'default', '*', '*'));
        this._factories.add(new MqttGatewayServiceFactory());
    }
}

export const handler = new MqttGatewayLambdaFunction().getHandler();