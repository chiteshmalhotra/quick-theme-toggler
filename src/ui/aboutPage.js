import Adw from "gi://Adw";
import Gtk from "gi://Gtk";

import { createUrlRow } from "../utils/ui.js";

export function aboutPage(metadata) {
    const aboutPage = new Adw.PreferencesPage({ title: _("About"), icon_name: "about-symbolic" });

    // Group : Header
    const headerGroup = new Adw.PreferencesGroup();

    const headerBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL, halign: Gtk.Align.CENTER,
        margin_bottom: 12, margin_top: 12, spacing: 6
    });

    headerBox.append(
        new Gtk.Label({
            label: `${metadata.name} v${metadata.version}`,
            css_classes: ["title-1"],
        })
    );
    headerBox.append(
        new Gtk.Label({
            label: _("Created by Chitesh Malhotra"),
            css_classes: ["heading", "dim-label"],
        })
    );
    headerGroup.add(headerBox);
    aboutPage.add(headerGroup);

    // Group : Links
    const linksGroup = new Adw.PreferencesGroup({});

    linksGroup.add(createUrlRow(metadata.url, _("Project Repository"), "github-symbolic"));
    linksGroup.add(createUrlRow(`${metadata.url}/issues`, _("Report Bug"), "report-symbolic"));
    linksGroup.add(createUrlRow(`${metadata.url}/blob/main/LICENSE.txt`, _("License"), "license-symbolic"));

    aboutPage.add(linksGroup);

    return aboutPage;
}