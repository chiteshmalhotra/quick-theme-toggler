import Gtk from "gi://Gtk";
import Gdk from "gi://Gdk";
import Gio from "gi://Gio";

import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { appearancePage } from "./ui/appearancePage.js";
import { behaviourPage } from "./ui/behaviourPage.js";
import { aboutPage } from "./ui/aboutPage.js";

export default class PanelIconPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Load Icons
        const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default());
        const iconsPath = this.dir.get_child("icons").get_path();

        if (!iconTheme.get_search_path().includes(iconsPath)) {
            iconTheme.add_search_path(iconsPath)
        }

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
        window.search_enabled = true;
        window._settings = this.getSettings();

        // Add pages
        window.add(appearancePage(window));
        window.add(behaviourPage(window));
        window.add(aboutPage(window, this.metadata));
    }
}