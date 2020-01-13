let _ = require('lodash');
let async = require('async');

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
import { GatewayPingReqMessage } from '../protocol/GatewayPingReqMessage';
import { GatewayPingMessage } from '../protocol/GatewayPingMessage';
import { DevicePingReqMessage } from '../protocol/DevicePingReqMessage';
import { DevicePingMessage } from '../protocol/DevicePingMessage';

export class PingProcessor extends MessageProcessor {

    public processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, 
        callback: (err: any) => void): void {
        if (message instanceof GatewayPingMessage) {
            this.processGatewayPingMessage(gateway, <GatewayPingMessage>message, callback);
        } else if (message instanceof DevicePingMessage) {
            this.processDevicePingMessage(gateway, device, <DevicePingMessage>message, callback);
        } else {
            callback(null);
        }
    }

    private processGatewayPingMessage(gateway: GatewayV1, message: GatewayPingMessage,
        callback: (err?: any) => void): void {

        async.series([
            (callback) => {
                this.validateGateway(message.gw_udi, gateway, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(
                    this._correlationId, "Processed gw ping msg from %s : %s", gateway.org_id, gateway.udi
                );

                gateway.ping_time = message.time;
                this._dependencies.gatewaysConnector.updateGateway(gateway);
                callback();
            }
        ], callback);
    }

    private processDevicePingMessage(gateway: GatewayV1, device: DeviceV1, message: DevicePingMessage,
        callback: (err?: any) => void): void {

        async.series([
            (callback) => {
                this.validateDevice(message.device_udi, device, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(
                    this._correlationId, "Processed dev ping msg from %s : %s", device.org_id, device.udi
                );

                device.ping_time = message.time;
                this._dependencies.devicesConnector.updateDevice(device);
                callback();
            }
        ], callback);
    }

    public pingGateway(correlationId: string, orgId: string, gatewayId: string,
        callback?: (err: any) => void): void {

        let gateway: GatewayV1;

        async.series([
            // Find all gateways for specified organization
            (callback) => {
                this._dependencies.gatewaysConnector.findGatewayById(gatewayId, (err, data) => {
                    gateway = data;
                    callback(err);
                });
            },
            // Send messages to all devices throught all organizations
            (callback) => {
                let timestamp = new Date().getTime() / 1000;

                if (gateway != null)
                    this.sendGatewayPingMessage(gateway, timestamp);

                callback();
            }
        ], callback);
    }

    public sendGatewayPingMessage(gateway: GatewayV1, timestamp: number): void {
        let message = new GatewayPingReqMessage();
        message.org_id = gateway.org_id;
        message.gw_udi = gateway.udi;

        this._dependencies.logger.debug(
            this._correlationId, "Sending gw ping msg to %s : %s", gateway.org_id, gateway.udi
        );

        this.sendMessage(gateway.udi, message);
    }

    public pingDevice(correlationId: string, orgId: string, deviceId: string,
        callback?: (err: any) => void): void {

        let device: DeviceV1;
        let gateways: GatewayV1[];

        async.series([
            // Get device reference
            (callback) => {
                this._dependencies.devicesConnector.findDeviceById(deviceId, (err, data) => {
                    // Validate device
                    if (data != null)
                        err = this.validateDevice(deviceId, data);

                    device = data;

                    callback(err);
                });
            },
            // Find all gateways for specified organization
            (callback) => {
                this._dependencies.gatewaysConnector.findGatewaysByorgId(orgId, (err, data) => {
                    gateways = data;
                    callback(err);
                });
            },
            // Send messages to all devices throught all organizations
            (callback) => {
                let timestamp = new Date().getTime() / 1000;

                this.sendDevicePingMessage(gateways, device, timestamp);

                callback();
            }
        ], callback);
    }

    private sendDevicePingMessage(gateways: GatewayV1[], device: DeviceV1,
        timestamp: number): void {

        let message = new DevicePingReqMessage();
        message.org_id = device.org_id;
        message.device_udi = device.udi;
        message.timestamp = timestamp || new Date().getTime() / 1000;

        this._dependencies.logger.debug(
            this._correlationId, "Sending device ping msg to %s : %s", device.org_id, device.udi
        );
        
        // Send message directly to device
        this.sendMessage(device.udi, message);

        // Send through gateways
        for (let gateway of gateways) {
            message.gw_udi = gateway.udi;
            this.sendMessage(gateway.udi, message);
        }
    }

}