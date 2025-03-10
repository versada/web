import {ListRenderer} from "@web/views/list/list_renderer";
import {useMagicColumnWidths} from "./column_width_hook.esm";
import {patch} from "@web/core/utils/patch";

patch(ListRenderer.prototype, {
    setup() {
        super.setup();
        this.columnWidths = useMagicColumnWidths(this.tableRef, () => {
            return {
                columns: this.columns,
                isEmpty:
                    !this.props.list.records.length ||
                    this.props.list.model.useSampleModel,
                hasSelectors: this.hasSelectors,
                hasOpenFormViewColumn: this.hasOpenFormViewColumn,
                hasActionsColumn: this.hasActionsColumn,
                model: this.props.list.model,
            };
        });
    },
});
