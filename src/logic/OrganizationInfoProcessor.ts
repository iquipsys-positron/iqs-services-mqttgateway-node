let _ = require('lodash');
let async = require('async');

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
import { DeviceInitMessage } from '../protocol/DeviceInitMessage';
import { StateUpdateMessage } from '../protocol/StateUpdateMessage';
import { StateUpdateMessage2 } from '../protocol/StateUpdateMessage2';
import { OrganizationInfoMessage } from '../protocol/OrganizationInfoMessage';

export class OrganizationInfoProcessor extends MessageProcessor {
    private _organizationInfoTickets: { [udi: string]: number } = {};
    
    public processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, 
        callback: (err: any) => void): void {
        if (message instanceof DeviceInitMessage) {
            let deviceInitMessage = <DeviceInitMessage>message;
            let organizationVersion = deviceInitMessage.data_version;
            let deviceUdi = deviceInitMessage.device_udi;
            this.processOrganizationInfoMessage(gateway, device, deviceUdi, organizationVersion, callback);
        } else if (message instanceof StateUpdateMessage) {
            let stateUpdateMessage = <StateUpdateMessage>message;
            let organizationVersion = stateUpdateMessage.data_version;
            let deviceUdi = stateUpdateMessage.device_udi;
            this.processOrganizationInfoMessage(gateway, device, deviceUdi, organizationVersion, callback);
        } else if (message instanceof StateUpdateMessage2) {
            let stateUpdateMessage = <StateUpdateMessage2>message;
            let organizationVersion = stateUpdateMessage.data_version;
            let deviceUdi = stateUpdateMessage.device_udi;
            this.processOrganizationInfoMessage(gateway, device, deviceUdi, organizationVersion, callback);
        } else {
            callback(null);
        }
    }

    private processOrganizationInfoMessage(gateway: GatewayV1, device: DeviceV1, deviceUdi: string, organizationVersion: number,
        callback: (err: any) => void): void {
        
        // Skip if device wasn't identified
        if (device == null) {
            callback(null);
            return;
        }

        let organization: OrganizationV1;

        async.series([
            // Validate device
            (callback) => {
                this.validateDevice(deviceUdi, device, callback);
            },
            // Find organization
            (callback) => {
                this._dependencies.organizationsConnector.findOrganizationById(device.org_id, (err, data) => {
                    organization = data;
                    callback(null);
                });
            },
            // Send organization info
            (callback) => {
                if (organization && organization.version != organizationVersion)
                    this.sendOrganizationInfoMessage(gateway, device, organization);
                callback();
            }
        ], callback);
    }

    private sendOrganizationInfoMessage(gateway: GatewayV1, device: DeviceV1, organization: OrganizationV1): void {
        // Prevent flooding with info messages
        let ticket = this._organizationInfoTickets[device.udi];
        let now = new Date().getTime();
        if (ticket && now - ticket < 300000) return;
        this._organizationInfoTickets[device.udi] = now;

        let message = new OrganizationInfoMessage();
        message.org_id = organization.id;
        message.gw_udi = gateway != null ? gateway.udi : null;
        message.device_udi = device.udi;
        message.time = new Date();

        let currentOrganizationVersion = organization.version && organization.version > 0 ? organization.version : 1;
        message.data_version = currentOrganizationVersion;

        let center = organization.center && organization.center.coordinates ? organization.center : null;
        message.center_lng = center ? center.coordinates[0] : 0;
        message.center_lat = center ? center.coordinates[1] : 0;
            
        message.radius = organization.radius || 10;
        if (organization.params) {
            message.active_int = organization.params['active_int'] || 60;
            message.inactive_int = organization.params['inactive_int'] || 300;
            message.offsite_int = organization.params['offsite_int'] || 900;
            message.data_rate = organization.params['data_rate'] || 3;
        }

        this._dependencies.logger.debug(
            this._correlationId, "Sending organization info msg to %s : %s", device.org_id, device.udi
        );

        // Send to gateway or to device directly
        let udi = message.gw_udi || message.device_udi;
        this.sendMessage(udi, message);
    }
    
}