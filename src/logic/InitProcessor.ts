let _ = require('lodash');
let async = require('async');

import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
import { GatewayInitMessage } from '../protocol/GatewayInitMessage';
import { DeviceInitMessage } from '../protocol/DeviceInitMessage';

export class InitProcessor extends MessageProcessor {

    public processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, 
        callback: (err: any) => void): void {
        if (message instanceof GatewayInitMessage) {
            this.processGatewayInitMessage(gateway, <GatewayInitMessage>message, callback);
        } else if (message instanceof DeviceInitMessage) {
            this.processDeviceInitMessage(gateway, device, <DeviceInitMessage>message, callback);
        } else {
            callback(null);
        }
    }

    private processGatewayInitMessage(gateway: GatewayV1, message: GatewayInitMessage,
        callback: (err: any) => void): void {
        
        async.series([
            (callback) => {
                this.validateGateway(message.gw_udi, gateway, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(
                    this._correlationId, "Processed gw init msg from %s : %s", gateway.org_id, gateway.udi
                );
                
                // Update gateway information
                if (gateway.model != message.gw_model || gateway.version != message.gw_version) {
                    gateway.model = message.gw_model;
                    gateway.version = message.gw_version;
                    gateway.rec_time = new Date();

                    this._dependencies.gatewaysConnector.updateGateway(gateway);
                }

                callback();
            }
        ], callback);
    }

    private processDeviceInitMessage(gateway: GatewayV1, device: DeviceV1, message: DeviceInitMessage,
        callback: (err: any) => void): void {

        async.series([
            (callback) => {
                this.validateDevice(message.device_udi, device, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(
                    this._correlationId, "Processed dev init msg from %s : %s", device.org_id, device.udi
                );
                
                // Update device information
                if (device.version != message.device_version) {
                    device.version = message.device_version;
                    this._dependencies.devicesConnector.updateDevice(device);
                }

                callback();
            }
        ], callback);
    }

}