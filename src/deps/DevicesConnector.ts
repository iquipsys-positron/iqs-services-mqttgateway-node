let _ = require('lodash');
let async = require('async');

import { FilterParams } from 'pip-services-commons-node';
import { ILogger } from 'pip-services-components-node';
import { BadRequestException } from 'pip-services-commons-node';
import { InvalidStateException } from 'pip-services-commons-node';
import { NotFoundException } from 'pip-services-commons-node';

import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceTypeV1 } from 'iqs-clients-devices-node';
import { DeviceStatusV1 } from 'iqs-clients-devices-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { IDevicesClientV1 } from 'iqs-clients-devices-node';

export class DevicesConnector {
    private _cacheByUdi: { [udi: string]: DeviceV1 } = {};
    private _cacheById: { [id: string]: DeviceV1 } = {};
    private _cacheTime: Date = new Date();
    private _cacheTimeout: number = 15000;

    public constructor(
        private _logger: ILogger,
        private _devicesClient: IDevicesClientV1
    ) { }

    private clearObsoleteCache() {
        let now = new Date();
        let elapsed = now.getTime() - this._cacheTime.getTime();
        if (elapsed > this._cacheTimeout) {
            this._cacheByUdi = {};
            this._cacheById = {};
            this._cacheTime = now;
        }
    }

    private getDeviceFromCacheByUdi(orgId: string, udi: string): DeviceV1 {
        this.clearObsoleteCache();
        if (orgId)
            return this._cacheByUdi[orgId + '_' + udi];
        else
            return this._cacheByUdi[udi];
    }

    private getDeviceFromCacheById(id: string): DeviceV1 {
        this.clearObsoleteCache();
        return this._cacheById[id];
    }

    private storeDeviceToCache(device: DeviceV1): void {
        if (device) {
            this.clearObsoleteCache();
            if (device.org_id) {
                this._cacheByUdi[device.org_id + '_' + device.udi] = device;
            }
            else {
                this._cacheByUdi[device.udi] = device;
            }
            this._cacheById[device.id] = device;
        }
    }

    public resolveDeviceWithoutorgId(udi: string,
        callback: (err: any, device: DeviceV1) => void): void {

        if (udi == '') {
            callback(
                new BadRequestException(
                    'teltonika-gateway',
                    'NO_DEVICE_UDI',
                    'Device UDI is not defined'
                ),
                null
            );
            return;
        }

        // Retrieve from cache
        udi = udi.toLowerCase();
        let device = this.getDeviceFromCacheByUdi(null, udi);
        if (device != null) {
            callback(null, device);
            return;
        }
        
        let filter = FilterParams.fromTuples(
            'udi', udi,      
            'status', DeviceStatusV1.Active
        );

        this._devicesClient.getDevices(
            'mqtt-gateway', filter, null,
            (err, page) => {
                let devices = page != null ? page.data : null;
                this.storeDeviceToCache(devices[0]);
                callback(err, devices[0]);
            }
        );
    }

    public resolveDevice(orgId: string, udi: string,
        callback: (err: any, device: DeviceV1) => void): void {

        if (orgId == '') {
            callback(
                new BadRequestException(
                    'mqtt-gateway',
                    'UNKNOWN_SITE',
                    'Cannot determine organization'
                ),
                null
            );
            return;
        }

        if (udi == '') {
            callback(
                new BadRequestException(
                    'mqtt-gateway',
                    'NO_DEVICE_UDI',
                    'Device UDI is not defined'
                ),
                null
            );
            return;
        }

        // Retrieve from cache
        let device = this.getDeviceFromCacheByUdi(orgId, udi);
        if (device) {
            callback(null, device);
            return;
        }

        this._devicesClient.getOrCreateDevice(
            'mqtt-gateway',
            orgId, DeviceTypeV1.Unknown, null, udi,
            (err, device) => {
                // if (err == null && device && device.status != DeviceStatusV1.Active) {
                //     err = new InvalidStateException(
                //         'mqtt-gateway',
                //         'DEVICE_INACTIVE',
                //         'Device ' + udi + ' is inactive'
                //     ).withDetails('udi', udi);
                // }

                this.storeDeviceToCache(device);

                callback(err, device);
            }
        );
    }

    public findDeviceById(deviceId: string,
        callback: (err: any, device: DeviceV1) => void): void {

        // Retrieve from cache
        let device = this.getDeviceFromCacheById(deviceId);
        if (device) {
            callback(null, device);
            return;
        }

        this._devicesClient.getDeviceById(
            'mqtt-gateway',
            deviceId,
            (err, device) => {
                this.storeDeviceToCache(device);

                callback(err, device);
            }
        );
    }

    public getDevicesByorgId(orgId: string,
        callback: (err: any, devices: DeviceV1[]) => void): void {

        this._devicesClient.getDevices(
            'mqtt-gateway',
            FilterParams.fromTuples(
                'org_id', orgId,
                'status', DeviceStatusV1.Active
            ),
            null,
            (err, page) => {
                let devices = page ? page.data : null;
                callback(err, devices);
            }
        );
    }

    // Operation is performed asynchronously
    public updateDevice(device: DeviceV1): void {
        if (device == null) return;

        this._devicesClient.updateDevice(
            'mqtt-gateway',
            device,
            (err, device) => {
                this.storeDeviceToCache(device);

                if (err) this._logger.error('mqtt-gateway', err, 'Failed to update device info');
            }
        )
    }

}