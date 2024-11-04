/** @odoo-module **/
import { X2ManyField } from "@web/views/fields/x2many/x2many_field";
import { XMLParser } from "@web/core/utils/xml";
import { evaluateExpr } from "@web/core/py_js/py";
import { patch } from "@web/core/utils/patch";

patch(X2ManyField.prototype, {
    get rendererProps() {
        this.updateActiveActions();
        return super.rendererProps;  // Use 'super' directly in Odoo 17
    },
    updateActiveActions() {
        if (this.viewMode === "list" && this.activeActions.type === "one2many") {
            const parser = new XMLParser();
            const archInfo = this.activeField.views[this.viewMode];
            const xmlDoc = parser.parseXML(archInfo.__rawArch);

            ["create", "delete"].forEach((item) => {
                if (this.activeActions[item] && xmlDoc.attributes?.[item]) {
                    const expr = xmlDoc.getAttribute(item);
                    try {
                        this.activeActions[item] = evaluateExpr(
                            expr,
                            this.props.record.data
                        );
                    } catch (ignored) {
                        console.warn(
                            `[web_action_conditionable] Unrecognized expr '${expr}', ignoring`
                        );
                    }
                }
            });
        }
    },
});
