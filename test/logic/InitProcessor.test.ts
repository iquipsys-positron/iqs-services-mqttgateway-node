let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { InitProcessor } from '../../src/logic/InitProcessor';
import { GatewayInitMessage } from '../../src/protocol/GatewayInitMessage';
import { DeviceInitMessage } from '../../src/protocol/DeviceInitMessage';

import { TestDependencies } from '../deps/TestDependencies';
import { TestGatewayConnector } from '../connectors/TestGatewayConnector';

suite('InitProcessor', ()=> {    
    let processor: InitProcessor;
    let dependencies: TestDependencies;
    let connector: TestGatewayConnector;

    setup(() => {
        connector = new TestGatewayConnector();

        dependencies = new TestDependencies();
        dependencies.connector = connector;

        processor = new InitProcessor();
        processor.setDependencies(dependencies);
    });
    
    test('Receive gateway init message', (done) => {
        let gateway = <GatewayV1> {
            id: '1',
            udi: '111',
            org_id: '1',
            active: true
        };

        let message = new GatewayInitMessage();
        message.org_id = '1';
        message.gw_udi = '111';
        message.gw_model = 'ABC';
        message.gw_version = 123;

        processor.processMessage(gateway, null, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 0);

            done();
        });
    });

    test('Receive device init message', (done) => {
        let device = <DeviceV1> {
            id: '1',
            udi: '111',
            org_id: '1',
            status: 'active'
        };

        let message = new DeviceInitMessage();
        message.org_id = '1';
        message.device_udi = '111';
        message.data_version = 2;
        message.device_version = 123;

        processor.processMessage(null, device, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 0);

            done();
        });
    });
    
});