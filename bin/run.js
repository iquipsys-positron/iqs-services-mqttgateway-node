let MqttGatewayProcess = require('../obj/src/container/MqttGatewayProcess').MqttGatewayProcess;

try {
    new MqttGatewayProcess().run(process.argv);
} catch (ex) {
    console.error(ex);
}
