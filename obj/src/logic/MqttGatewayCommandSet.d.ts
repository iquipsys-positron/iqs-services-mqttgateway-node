import { CommandSet } from 'pip-services-commons-node';
import { IMqttGatewayController } from './IMqttGatewayController';
export declare class MqttGatewayCommandSet extends CommandSet {
    private _logic;
    constructor(logic: IMqttGatewayController);
    private makeSendCommandsCommand;
    private makeBroadcastCommandsCommand;
    private makeSendSignalCommand;
    private makeBroadcastSignalCommand;
    private makePingGatewayCommand;
    private makePingDeviceCommand;
    private makeRequestStatistisCommand;
}
