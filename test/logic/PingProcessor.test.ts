let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { PingProcessor } from '../../src/logic/PingProcessor';
import { GatewayPingMessage } from '../../src/protocol/GatewayPingMessage';
import { GatewayPingReqMessage } from '../../src/protocol/GatewayPingReqMessage';
import { DevicePingMessage } from '../../src/protocol/DevicePingMessage';
import { DevicePingReqMessage } from '../../src/protocol/DevicePingReqMessage';

import { TestDependencies } from '../deps/TestDependencies';
import { TestGatewayConnector } from '../connectors/TestGatewayConnector';
import { GatewaysMemoryClientV1 } from 'iqs-clients-gateways-node/obj/src/version1/GatewaysMemoryClientV1';

suite('PingProcessor', ()=> {    
    let processor: PingProcessor;
    let dependencies: TestDependencies;
    let connector: TestGatewayConnector;

    let GATEWAY1 = <GatewayV1> {
        id: '1',
        udi: '111',
        org_id: '1',
        active: true
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

        let gatewayClient = dependencies.gatewaysClient;
        gatewayClient.createGateway(null, GATEWAY1, (err, gw) => {});

        let devicesClient = dependencies.devicesClient;
        devicesClient.createDevice(null, DEVICE1, (err, gw) => {});
            
        processor = new PingProcessor();
        processor.setDependencies(dependencies);
    });
    
    test('Receive gateway ping message', (done) => {
        let message = new GatewayPingMessage();
        message.org_id = '1';
        message.gw_udi = '111';

        processor.processMessage(GATEWAY1, null, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 0);

            done();
        });
    });

    test('Send gateway ping req message', (done) => {
        processor.pingGateway(null, '1', '1', (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 1);
            assert.lengthOf(connector.outgoing[0], 12);

            done();
        });
    });
    
    test('Receive device ping message', (done) => {
        let message = new DevicePingMessage();
        message.org_id = '1';
        message.device_udi = '111';

        processor.processMessage(null, DEVICE1, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 0);

            done();
        });
    });

    test('Send device ping req message', (done) => {
        processor.pingDevice(null, '1', '1', (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 2);
            assert.lengthOf(connector.outgoing[0], 16);

            done();
        });
    });
    
});