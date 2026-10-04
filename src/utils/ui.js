import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from "gi://Gio";
import Gtk from 'gi://Gtk';

export function createBgRow(settings, key, title) {
    const thumbnailImage = new Gtk.Picture({
        height_request: 108,
        width_request: 180,
        content_fit: Gtk.ContentFit.COVER
    });

    const updateThumbnail = () => {
        const path = settings.get_string(key);
        thumbnailImage.set_file(path ? Gio.File.new_for_path(path) : null);
    };
    updateThumbnail();
    settings.connect(`changed::${key}`, updateThumbnail);

    const imageBtn = new Gtk.Button({
        valign: Gtk.Align.CENTER,
        css_classes: ["bg-btn"],
        child: thumbnailImage,
    });

    imageBtn.connect("clicked", (btn) => {
        const filter = new Gtk.FileFilter({ name: "Images" });
        filter.add_mime_type("image/*");

        const filters = Gio.ListStore.new(Gtk.FileFilter);
        filters.append(filter);

        const dialog = new Gtk.FileDialog({ title: "Select Wallpaper", modal: true, filters });

        dialog.open(btn.get_root(), null, (_, res) => {
            try {
                const file = dialog.open_finish(res);
                if (file) settings.set_string(key, file.get_path());
            } catch (_) { }
        });
    });

    const vbox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
        spacing: 8,
    });

    vbox.append(imageBtn);
    vbox.append(new Gtk.Label({ label: title, css_classes: ["heading"] }));

    return new Adw.ActionRow({ child: vbox });
}

export function createAccentRow(settings, key, title, model) {
    const row = new Adw.ActionRow({ title: title, activatable: true });

    const box = new Gtk.Box({
        valign: Gtk.Align.CENTER,
        spacing: 8
    });

    let group = null;
    const btns = [];
    const activeVal = settings.get_int(key);

    model.forEach((name, idx) => {
        const btn = new Gtk.ToggleButton({ 
            group: group, 
            tooltip_text: name, 
            active: idx === activeVal, 
            css_classes: ['accent', name]
        });

        if (!group) group = btn;

        btn.connect('toggled', () => {
            if (btn.get_active()) settings.set_int(key, idx)
        });

        box.append(btn);
        btns.push(btn);
    });

    // Sync UI
    settings.connect(`changed::${key}`, () => {
        btns[settings.get_int(key)]?.set_active(true)
    });

    // Activate
    row.connect('activated', () => {
        const activeIdx = settings.get_int(key);
        const nextIdx = (activeIdx + 1) % model.length;
        btns[nextIdx].set_active(true);
    });

    row.add_suffix(box);
    return row;
}

export function createShortcutRow(settings, key, title) {
    const row = new Adw.ActionRow({ title: title, activatable: false });

    // btns
    const button = new Gtk.Button({ valign: Gtk.Align.CENTER });
    const reset = new Gtk.Button({
        icon_name: "view-refresh-symbolic",
        css_classes: ["destructive-action"],
        tooltip_text: "Reset Shortcut",
        valign: Gtk.Align.CENTER
    });

    // labels
    const shortcutLabel = new Gtk.ShortcutLabel();
    const disabledLabel = new Gtk.Label({ label: 'Disabled', css_classes: ['dim-label'] });
    const enterLabel = new Gtk.Label({ label: 'Press new Shortcut' });

    // Helpers
    const getAccel = () => {
        const strv = settings.get_strv(key);
        return strv.length > 0 ? strv[0] : '';
    };

    const updateButton = (accel) => {
        shortcutLabel.accelerator = accel;
        button.child = accel ? shortcutLabel : disabledLabel
    };

    // Initialize
    updateButton(getAccel());

    // Add btns
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
                settings.set_strv(key, []);
                finishBinding('');
                return true;
            }

            // Capture valid shortcut
            if (Gtk.accelerator_valid(keyval, mask)) {
                const accel = Gtk.accelerator_name(keyval, mask);
                settings.set_strv(key, [accel]);
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

    row.add_suffix(reset);
    reset.connect('clicked', () => { settings.reset(key); updateButton(getAccel()) });

    return row;
}

export function createUrlRow(url, title, icon) {
    const row = new Adw.ActionRow({
        title: title, activatable: true, icon_name: icon,
        cursor: Gdk.Cursor.new_from_name("pointer", null)
    });

    row.add_suffix(new Gtk.Image({ icon_name: "adw-external-link-symbolic", valign: Gtk.Align.CENTER }));
    row.connect("activated", () => Gio.AppInfo.launch_default_for_uri_async(url, null));

    return row;
}

export function createEntryRow(settings, key, title) {
    const row = new Adw.ActionRow({ title: title });

    const entry = new Gtk.Entry({
        valign: Gtk.Align.CENTER,
        hexpand: false,
    });

    settings.bind(key, entry, "text", Gio.SettingsBindFlags.DEFAULT);

    row.set_activatable_widget(entry);
    row.add_suffix(entry);

    return row;
}