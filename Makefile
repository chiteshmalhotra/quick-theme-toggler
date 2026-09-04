UUID = quick-theme-toggler@chiteshmalhotra
INSTALLBASE = $(HOME)/.local/share/gnome-shell/extensions
TARGET_DIR = $(INSTALLBASE)/$(UUID)

SRC_DIR = src
SCHEMA_DIR = $(SRC_DIR)/schemas
SCHEMA_XML = $(wildcard $(SCHEMA_DIR)/*.xml)

.PHONY: all extension build install uninstall enable disable clean

all: build install enable

extension: $(SCHEMA_DIR)/gschemas.compiled

$(SCHEMA_DIR)/gschemas.compiled: $(SCHEMA_XML)
	glib-compile-schemas $(SCHEMA_DIR)/

build: extension

install: build
	@rm -rf $(TARGET_DIR)
	@mkdir -p $(TARGET_DIR)/schemas
	@cp $(SRC_DIR)/*.js $(SRC_DIR)/metadata.json $(TARGET_DIR)/ 2>/dev/null || true
	@[ -d $(SRC_DIR)/ui ] && cp -r $(SRC_DIR)/ui $(TARGET_DIR)/ || true
	@[ -f LICENSE.txt ] && cp LICENSE.txt $(TARGET_DIR)/ || true
	@[ -f README.md ] && cp README.md $(TARGET_DIR)/ || true
	@cp $(SCHEMA_DIR)/*.gschema.xml $(SCHEMA_DIR)/gschemas.compiled $(TARGET_DIR)/schemas/ 2>/dev/null || true
	@echo "Installed directly to $(TARGET_DIR)"

uninstall:
	@rm -rf $(TARGET_DIR)

enable:
	@gnome-extensions enable $(UUID)

disable:
	@gnome-extensions disable $(UUID)

clean:
	@rm -rf $(SCHEMA_DIR)/gschemas.compiled