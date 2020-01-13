let _ = require('lodash');
let async = require('async');

import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
import { SignalMessage } from '../protocol/SignalMessage';

export class SignalProcessor extends MessageProcessor {

    public sendSignal(correlationId: string, orgId: string, deviceId: string,
        signal: number, timestamp: number,
        callback?: (err: any, result: boolean) => void): void {

        this._dependencies.devicesConnector.findDeviceById(deviceId, (err, device) => {
            if (err == null)
                err = this.validateDevice(deviceId, device);

            if (err == null && device)
                this.sendSignalMessages(correlationId, orgId, [device], signal, timestamp, callback);
            else if (callback) callback(err, false);
        });
    }

    public broadcastSignal(correlationId: string, orgId: string, signal: number, timestamp: number,
        callback?: (err: any, result: boolean) => void): void {

        this._dependencies.devicesConnector.getDevicesByorgId(orgId, (err, devices) => {
            if (devices != null)
                devices = _.filter(devices, d => this.validateDevice(d.udi, d) == null);

            if (err == null && devices)
                this.sendSignalMessages(correlationId, orgId, devices, signal, timestamp, callback);
            else if (callback) callback(err, false);
        });
    }

    private sendSignalMessages(correlationId: string,
        orgId: string, devices: DeviceV1[], signal: number, timestamp: number,
        callback?: (err: any, result: boolean) => void): void {

        let gateways: GatewayV1[] = [];
        let result = false;

        async.series([
            // Find all gateways for specified organization
            (callback) => {
                this._dependencies.gatewaysConnector.findGatewaysByorgId(orgId, (err, data) => {
                    gateways = data;
                    callback(err);
                });
            },
            // Send messages to all devices throught all organizations
            (callback) => {
                let message = new SignalMessage();
                message.org_id = orgId;
                message.signal = signal;
                message.timestamp = timestamp || new Date().getTime() / 1000;

                for (let device of devices) {
                    message.gw_udi = null;
                    message.device_udi = device.udi;

                    this._dependencies.logger.debug(
                        correlationId, "Sending signal msg to %s : %s", device.org_id, device.udi
                    );
                    
                    // Send directly to device
                    this.sendMessage(device.udi, message);

                    // Send through gateways
                    for (let gateway of gateways) {
                        message.gw_udi = gateway.udi;
                        this.sendMessage(gateway.udi, message);
                        result = true;
                    }
                }

                callback();
            }
        ], (err) => {
            if (callback) callback(err, err == null ? result : null);
        });
    }

}