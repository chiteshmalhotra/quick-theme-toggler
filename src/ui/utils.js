import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";


export function createSegmentedRow(window, settingsKey, title, options, isColor = false) {
    const settings = window._settings;

    const row = new Adw.ActionRow({ title: _(title), activatable: true });

    const box = new Gtk.Box({
        valign: Gtk.Align.CENTER,
        ...(isColor ? { spacing: 8 } : { css_classes: ['linked'] })
    });

    let group = null;
    const buttons = [];
    const currentVal = settings.get_int(settingsKey);

    options.forEach((key, index) => {
        const btn = new Gtk.ToggleButton({
            group: group,
            active: index === currentVal,
            ...(isColor
                ? { tooltip_text: key, css_classes: ['circular', 'accent-btn', key] }
                : { label: key }
            )
        });

        if (!group) group = btn;

        btn.connect('toggled', () => {
            if (btn.get_active()) settings.set_int(settingsKey, index)
        });

        box.append(btn);
        buttons.push(btn);
    });

    // Activate
    row.connect('activated', () => buttons[currentVal].active = true);

    row.add_suffix(box);
    return row;
}

export function createShortcutRow(window, settingsKey, title) {
    const settings = window._settings;

    const row = new Adw.ActionRow({ title: title, activatable: false });

    const button = new Gtk.Button({ valign: Gtk.Align.CENTER });

    const reset = new Gtk.Button({
        icon_name: "user-trash-symbolic",
        valign: Gtk.Align.CENTER,
        css_classes: ["destructive-action"],
        tooltip_text: "Reset Shortcut"
    });

    // labels
    const shortcutLabel = new Gtk.ShortcutLabel({ valign: Gtk.Align.CENTER });
    const disabledLabel = new Gtk.Label({ label: 'Disabled', css_classes: ['dim-label'] });
    const enterLabel = new Gtk.Label({ label: 'New shortcut...' });

    // Helpers
    const getAccel = () => {
        const strv = settings.get_strv(settingsKey);
        return strv.length > 0 ? strv[0] : '';
    };

    const updateButton = (accel) => {
        shortcutLabel.accelerator = accel;
        button.child = accel ? shortcutLabel : disabledLabel;

        const isDefault = settings.get_user_value(settingsKey) === null;
        reset.visible = !isDefault;
    };

    // Initialize
    updateButton(getAccel());

    // Buttons
    row.add_suffix(reset);
    reset.connect('clicked', () => { settings.reset(settingsKey); updateButton(getAccel()) });

    row.add_suffix(button);
    button.connect('clicked', () => {
        button.set_child(enterLabel);

        const root = button.get_root();
        if (!root) return;

        const controller = new Gtk.EventControllerKey();
        root.add_controller(controller);

        const signalId = controller.connect('key-pressed', (ctrl, keyval, keycode, state) => {
            const mask = state & Gtk.accelerator_get_default_mod_mask();
            const keyName = Gdk.keyval_name(keyval);

            // Cancel (Escape)
            if (keyName === 'Escape') {
                finishBinding(getAccel());
                return true;
            }

            // Clear shortcut (Backspace / Delete)
            if (keyName === 'BackSpace' || keyName === 'Delete') {
                settings.set_strv(settingsKey, []);
                finishBinding('');
                return true;
            }

            // Capture valid shortcut
            if (Gtk.accelerator_valid(keyval, mask)) {
                const accel = Gtk.accelerator_name(keyval, mask);
                settings.set_strv(settingsKey, [accel]);
                finishBinding(accel);
                return true;
            }

            return false;
        });

        function finishBinding(accel) {
            controller.disconnect(signalId);
            root.remove_controller(controller);
            updateButton(accel);
        }
    });

    return row;
}