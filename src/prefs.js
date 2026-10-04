import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";
import Gio from "gi://Gio";

import { appearancePage } from "./ui/appearancePage.js";
import { behaviourPage } from "./ui/behaviourPage.js";
import { aboutPage } from "./ui/aboutPage.js";

import { ExtensionPreferences, gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
globalThis._ = _;

export default class PanelIconPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Load Icons
        let iconPath = this.dir.get_child("icons").get_path();
        let iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default());
        iconTheme.add_search_path(iconPath);

        // Load CSS
        const provider = new Gtk.CssProvider();
        const cssFile = Gio.File.new_for_path(`${this.path}/stylesheet.css`);
        provider.load_from_file(cssFile);

        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        );

        // Set window properties
        window.default_width = 440;
        window.search_enabled = true;
        window._settings = this.getSettings();
        
        // Add pages
        window.add(appearancePage(window._settings));
        window.add(behaviourPage(window._settings));
        window.add(aboutPage(this.metadata));
    }
}