"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
class CommandValueV1Schema extends pip_services_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('id', pip_services_commons_node_2.TypeCode.Integer);
        this.withRequiredProperty('val', pip_services_commons_node_2.TypeCode.Float);
    }
}
exports.CommandValueV1Schema = CommandValueV1Schema;
//# sourceMappingURL=CommandValueV1Schema.js.map