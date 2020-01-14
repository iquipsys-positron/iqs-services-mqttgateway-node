let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { NotFoundException } from 'pip-services3-commons-node';
import { InvalidStateException } from 'pip-services3-commons-node';

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { DeviceStatusV1 } from 'iqs-clients-devices-node';

import { ExternalDependencies } from '../deps/ExternalDependencies';
import { Message } from '../protocol/Message';
import { WriteStream } from 'iqs-libs-protocols-node';

export abstract class MessageProcessor implements IConfigurable {
    protected _correlationId = 'mqtt-gateway';
    protected _dependencies: ExternalDependencies;

    public setDependencies(dependencies: ExternalDependencies) {
        this._dependencies = dependencies;
    }

    public configure(config: ConfigParams): void {
    }

    public processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, 
        callback: (err: any) => void): void {
        callback(null);
    }

    protected validateGateway(gatewayUdi: string, gateway: GatewayV1,
        callback?: (err: any) => void): any {
        
        let err: any = null;

        if (gateway == null) {
            err = new NotFoundException(
                this._correlationId,
                'GATEWAY_NOT_FOUND',
                'Gateway ' + gatewayUdi + ' was not found'
            )
            .withDetails('gateway_udi', gatewayUdi);
        } 
        
        if (gateway && !gateway.active) {
            err = new InvalidStateException(
                this._correlationId,
                'GATEWAY_INACTIVE',
                'Gateway ' + gateway.id + ' is not active'
            )
            .withDetails('gateway_id', gateway.id);
        }

        if (callback) callback(err);
        return err;
    }

    protected validateDevice(deviceUdi: string, device: DeviceV1,
        callback?: (err: any) => void): any {
        
        let err: any = null;

        if (device == null) {
            err = new NotFoundException(
                this._correlationId,
                'DEVICE_NOT_FOUND',
                'Device ' + deviceUdi + ' was not found'
            )
            .withDetails('device_udi', deviceUdi);
        }

        if (device && device.status != DeviceStatusV1.Active) {
            err = new InvalidStateException(
                this._correlationId,
                'DEVICE_INACTIVE',
                'Device ' + device.id + ' is not active'
            )
            .withDetails('device_id', device.id);
        }

        if (callback) callback(err);
        return err;
    }

    protected sendMessage(udi: string, message: Message): void {
        let stream = new WriteStream();
        message.stream(stream);
        let buffer = stream.toBuffer();
        this._dependencies.connector.sendMessage(udi, buffer);
    }

}