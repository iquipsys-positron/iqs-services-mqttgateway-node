import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { MqttGatewayConnector } from '../connectors/MqttGatewayConnector';
import { MqttGatewayController } from '../logic/MqttGatewayController';
import { MqttGatewayHttpServiceV1 } from '../services/version1/MqttGatewayHttpServiceV1';

export class MqttGatewayServiceFactory extends Factory {
	public static Descriptor = new Descriptor("iqs-services-mqttgateway", "factory", "default", "default", "1.0");
	public static ConnectorDescriptor = new Descriptor("iqs-services-mqttgateway", "connector", "default", "*", "1.0");
	public static ControllerDescriptor = new Descriptor("iqs-services-mqttgateway", "controller", "default", "*", "1.0");
	public static HttpServiceDescriptor = new Descriptor("iqs-services-mqttgateway", "service", "http", "*", "1.0");
	
	constructor() {
		super();
		this.registerAsType(MqttGatewayServiceFactory.ConnectorDescriptor, MqttGatewayConnector);
		this.registerAsType(MqttGatewayServiceFactory.ControllerDescriptor, MqttGatewayController);
		this.registerAsType(MqttGatewayServiceFactory.HttpServiceDescriptor, MqttGatewayHttpServiceV1);
	}
	
}
