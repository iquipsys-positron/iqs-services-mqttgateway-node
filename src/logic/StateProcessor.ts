let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { BeaconV1 } from 'pip-clients-beacons-node';
import { StateUpdateV1 } from 'iqs-clients-stateupdates-node';

import { MessageProcessor } from './MessageProcessor';
import { ExternalDependencies } from '../deps/ExternalDependencies';
import { Message } from '../protocol/Message';
import { StateUpdateMessage } from '../protocol/StateUpdateMessage';
import { FilterParams } from 'pip-services3-commons-node/obj/src/data/FilterParams';
import { DeviceStatusV1 } from 'iqs-clients-devices-node/obj/src/version1/DeviceStatusV1';

export class StateProcessor extends MessageProcessor {

    public processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, 
        callback: (err: any) => void): void {
        if (message instanceof StateUpdateMessage) {
            this.processStateUpdateMessage(gateway, device, <StateUpdateMessage>message, callback);
        } else {
            callback(null);
        }
    }

    private createStateUpdate(device: DeviceV1, message: StateUpdateMessage): StateUpdateV1 {
        let stateUpdate: StateUpdateV1 = {
            org_id: null,
            device_id: null,
            time: new Date(), // message.time || new Date(),
            freezed: message.freezed,
            pressed: message.pressed,
            long_pressed: message.long_pressed,
            power: message.power,
            beacons: message.beacons
        };

        if (device != null) {
            stateUpdate.org_id = device.org_id;
            stateUpdate.device_id = device.id;
        }

        if (message.lat != 0 && message.lng != 0) {
            stateUpdate.lat = message.lat;
            stateUpdate.lng = message.lng;
            stateUpdate.alt = message.alt;
            stateUpdate.angle = message.angle;
            stateUpdate.speed = message.speed;
        }

        return stateUpdate;
    }

    private resolveBeacons(message: StateUpdateMessage,
        callback: (err: any, beacons: BeaconV1[]) => void): void {

        // Skip if beacons are not set
        if (message.beacons == null || message.beacons.length == 0) {
            callback(null, []);
            return;
        }

        let filter = FilterParams.fromTuples(
            'org_id', message.org_id,
            'udis', message.beacons
        );

        // Get beacons by organization (optional) and udis
        this._dependencies.beaconsClient.getBeacons(
            this._correlationId, filter, null,
            (err, page) => {
                let beacons = page ? page.data : [];
                callback(err, beacons);
            }
        );
    }

    private clarifyDevice(message: StateUpdateMessage, stateUpdate: StateUpdateV1, beacons: BeaconV1[],
        callback: (err: any) => void): void {

        // Skip if device is already defined
        if (stateUpdate.device_id != null) {
            callback(null);
            return;
        }
        
        // Skip if there are no beacons
        if (beacons == null || beacons.length == 0) {
            callback(null);
            return;
        }

        // Define all possible organization ids
        let orgIds: string[];
        if (message.org_id != '') {
            orgIds = [message.org_id];
        } else {
            orgIds = _.map(beacons, b => b.org_id);
            orgIds = _.uniq(orgIds);
        }

        let filter = FilterParams.fromTuples(
            'org_ids', orgIds,
            'udi', message.device_udi
        );

        // Find device by udi and organization ids
        this._dependencies.devicesClient.getDevices(
            this._correlationId, filter, null,
            (err, page) => {
                if (page != null && page.data.length > 0) {
                    let device = page.data[0];
                    stateUpdate.org_id = device.org_id;
                    stateUpdate.device_id = device.id;
                }
                callback(err);
            }
        );
    }

    private calculateBeaconsPosition(stateUpdate: StateUpdateV1, beacons: BeaconV1[]): void {

        // If position is already defined then skip
        //if (stateUpdate.lat != null && stateUpdate.lng != null) return

        // If beacons are not set then skip
        if (beacons == null || beacons.length == 0) return;

        // All beacons must be from the same organization
        beacons = _.filter(beacons, b => b.org_id = stateUpdate.org_id);
        
        let lat = 0;
        let lng = 0;
        let count = 0;

        // Calculate middle between beacon positions
        for (let beacon of beacons) {
            if (beacon.center && beacon.center.type == 'Point'
               &&  _.isArray(beacon.center.coordinates)
            ) {
                lng += beacon.center.coordinates[0];
                lat += beacon.center.coordinates[1];
                count += 1;
            }
        }

        // Assign calculated position
        if (count > 0) {
            stateUpdate.lat = lat / count;
            stateUpdate.lng = lng / count;
        }
    }
    
    private processStateUpdateMessage(gateway: GatewayV1, device: DeviceV1, message: StateUpdateMessage,
        callback: (err?: any) => void): void {

        // Skip if device isn't active
        if (device && device.status != DeviceStatusV1.Active) {
            callback();
            return;
        }
            
        let stateUpdate = this.createStateUpdate(device, message);
        let beacons: BeaconV1[];

        async.series([
            (callback) => {
                this.resolveBeacons(message, (err, data) => {
                    beacons = data;
                    callback(err);
                })
            },
            (callback) => {
                this.clarifyDevice(message, stateUpdate, beacons, callback);
            },
            (callback) => {
                this.calculateBeaconsPosition(stateUpdate, beacons);
                callback();
            },
            (callback) => {
                // Skip if device hasn't been defined
                if (stateUpdate.device_id == null) {
                    callback();
                    return;
                }

                this._dependencies.logger.debug(
                    this._correlationId, "Processed status msg from %s : %s", stateUpdate.org_id, message.device_udi
                );
        
                this._dependencies.statesClient.beginUpdateState(this._correlationId, stateUpdate, callback);
            }
        ], callback);
    }

}