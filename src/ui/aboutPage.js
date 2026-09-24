import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { createUrlRow } from "./utils.js";

export function aboutPage(metadata) {
    const aboutPage = new Adw.PreferencesPage({ title: _("About"), icon_name: "about-symbolic" });

    // Group : Header
    const headerGroup = new Adw.PreferencesGroup();

    const headerBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL, halign: Gtk.Align.CENTER,
        margin_bottom: 12, margin_top: 12, spacing: 6
    });

    headerBox.append(new Gtk.Label({ label: _(`Quick Theme Toggler V${metadata.version}`), css_classes: ["title-1"] }));
    headerBox.append(new Gtk.Label({ label: _("Created by Chitesh Malhotra"), css_classes: ["heading", "dim-label"] }));

    headerGroup.add(headerBox);
    aboutPage.add(headerGroup);

    // Group : Links
    const linksGroup = new Adw.PreferencesGroup({});

    linksGroup.add(createUrlRow(_("Project Repository"), "github-symbolic", metadata.url));
    linksGroup.add(createUrlRow(_("Report Bug"), "report-symbolic", `${metadata.url}/issues`));
    linksGroup.add(createUrlRow(_("License"), "license-symbolic", `${metadata.url}/blob/main/LICENSE.txt`));

    aboutPage.add(linksGroup);

    return aboutPage;
}