// -*- coding: utf-8 -*-
// © 2017 Therp BV <http://therp.nl>
// © 2021 Versada UAB <https://versada.eu/>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
odoo.define('web_onchange_action.BasicModel', function (require) {
"use strict";

var BasicModel = require('web.BasicModel');

BasicModel.include({
    /**
     * This is a full override of the original method (https://git.io/JOYrg) to
     * allow to execute actions returned from onchange.
     */
    _performOnChange: function (record, fields, viewType) {
        var self = this;
        var onchangeSpec = this._buildOnchangeSpecs(record, viewType);
        if (!onchangeSpec) {
            return Promise.resolve();
        }
        var idList = record.data.id ? [record.data.id] : [];
        var options = {
            full: true,
        };
        if (fields.length === 1) {
            fields = fields[0];
            // if only one field changed, add its context to the RPC context
            options.fieldName = fields;
        }
        var context = this._getContext(record, options);
        var currentData = this._generateOnChangeData(record, {changesOnly: false});

        return self._rpc({
                model: record.model,
                method: 'onchange',
                args: [idList, currentData, fields, onchangeSpec],
                context: context,
            })
            .then(function (result) {
                if (!record._changes) {
                    // if the _changes key does not exist anymore, it means that
                    // it was removed by discarding the changes after the rpc
                    // to onchange. So, in that case, the proper response is to
                    // ignore the onchange.
                    return;
                }
                var action = null;
                if (result.warning) {
                    if (result.warning.type === "action") {
                        action = JSON.parse(result.warning.message);
                        delete result.warning;
                    } else {
                        self.trigger_up('warning', result.warning);
                        record._warning = true;
                    }
                }
                if (result.domain) {
                    record._domains = _.extend(record._domains, result.domain);
                }
                return self._applyOnChange(result.value, record).then(function () {
                    if (action) {
                        self.do_action(action, {
                            on_close: function () {
                                self.trigger_up('reload');
                            }
                        });
                    }
                    return result;
                });
            });
    },
});

return BasicModel;

});
