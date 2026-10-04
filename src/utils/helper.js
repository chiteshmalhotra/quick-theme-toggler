import Gio from "gi://Gio";
import GLib from "gi://GLib";

export function getIconTheme() {
    const searchPaths = [
        GLib.build_filenamev([GLib.get_home_dir(), '.local', 'share', 'icons']),
        GLib.build_filenamev([GLib.get_home_dir(), '.icons']),
        '/usr/local/share/icons',
        '/usr/share/icons'
    ];

    const themeNames = new Set();

    for (const path of searchPaths) {
        const dir = Gio.File.new_for_path(path);
        if (!dir.query_exists(null)) continue;

        try {
            const fileEnumerator = dir.enumerate_children(
                'standard::name,standard::type',
                Gio.FileQueryInfoFlags.NONE,
                null
            );

            let fileInfo;

            while ((fileInfo = fileEnumerator.next_file(null)) !== null) {
                if (fileInfo.get_file_type() !== Gio.FileType.DIRECTORY) continue;
                const themeFolder = fileInfo.get_name();

                const indexFile = dir.get_child(themeFolder).get_child('index.theme');
                if (!indexFile.query_exists(null)) continue;
                
                themeNames.add(themeFolder);
            }
            fileEnumerator.close(null);
        } catch (e) {
            console.warn(`Failed to read directory ${path}: ${e.message}`);
        }
    }

    return Array.from(themeNames).sort();
}