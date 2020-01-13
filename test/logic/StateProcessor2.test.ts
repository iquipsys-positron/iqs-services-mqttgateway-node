let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { BeaconV1 } from 'pip-clients-beacons-node';

import { StateProcessor2 } from '../../src/logic/StateProcessor2';
import { StateUpdateMessage2 } from '../../src/protocol/StateUpdateMessage2';

import { TestDependencies } from '../deps/TestDependencies';
import { TestGatewayConnector } from '../connectors/TestGatewayConnector';
import { GatewaysMemoryClientV1 } from 'iqs-clients-gateways-node/obj/src/version1/GatewaysMemoryClientV1';

suite('StateProcessor2', ()=> {    
    let processor: StateProcessor2;
    let dependencies: TestDependencies;
    let connector: TestGatewayConnector;

    let BEACON1 = <BeaconV1> {
        id: '1',
        udi: '111',
        org_id: '1',
        center: {
            type: 'Point',
            coordinates: [1, 2]
        }
    };
    let DEVICE1 = <DeviceV1> {
        id: '1',
        udi: '111',
        org_id: '1',
        status: 'active'
    };
    
    setup(() => {
        connector = new TestGatewayConnector();

        dependencies = new TestDependencies();
        dependencies.connector = connector;

        let devicesClient = dependencies.devicesClient;
        devicesClient.createDevice(null, DEVICE1, (err, gw) => {});

        let beaconsClient = dependencies.beaconsClient;
        beaconsClient.createBeacon(null, BEACON1, (err, gw) => {});
        
        processor = new StateProcessor2();
        processor.setDependencies(dependencies);
    });

    test('Receive state update message without power parameter', (done) => {
        let message = new StateUpdateMessage2();
        message.org_id = '1';
        message.device_udi = '111';
        //message.freezed = true;
        message.params = [{ id: 2, val: 1 }];
        //message.pressed = true;
        message.events = [{ id: 1, val: 1 }];
        message.lat = 32;
        message.lng = -110;
        message.alt = 123;

        processor.processMessage(null, DEVICE1, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 0);

            done();
        });
    });
    
    test('Receive state update message', (done) => {
        let message = new StateUpdateMessage2();
        message.org_id = '1';
        message.device_udi = '111';
        // message.power = true;
        // message.freezed = true;
        message.params = [{ id: 1, val: 1 }, { id: 2, val: 1 }];
        //message.pressed = true;
        message.events = [{ id: 1, val: 1 }];
        message.lat = 32;
        message.lng = -110;
        message.alt = 123;

        processor.processMessage(null, DEVICE1, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 0);

            done();
        });
    });

    test('Receive state update with beacons', (done) => {
        let message = new StateUpdateMessage2();
        message.org_id = null;
        message.device_udi = '111';
        // message.power = true;
        // message.freezed = true;
        message.params = [{ id: 1, val: 1 }, { id: 2, val: 1 }];
        //message.pressed = true;
        message.events = [{ id: 1, val: 1 }];
        message.beacons = ['111', '222'];

        processor.processMessage(null, null, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 0);

            done();
        });
    });
    
});