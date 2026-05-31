export class InventoryManager
{
    constructor (scene)
    {
        this.scene = scene;
        this.items = [];
        this.maxSlots = 12;
        this.selectedKey = null;
        this.helpConfirmPending = false;
        this.helpWarningShownOnce = false;
        this._slotBgs = [];
        this._slotIcons = [];
        this._itemPopupNodes = [];
        this._createHUD();
    }

    _createHUD ()
    {
        const scene = this.scene;
        const w = scene.scale.width;
        const barY = 748;

        // Background bar
        scene.add.rectangle(w / 2, barY, w - 60, 38, 0x0c0906, 0.93)
            .setStrokeStyle(1, 0xaa7830)
            .setDepth(200)
            .setScrollFactor(0);

        scene.add.text(94, barY, 'Sac:', {
            fontFamily: 'Georgia',
            fontSize: 16,
            color: '#c4913e'
        }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        const startX = 154;
        const gap = 62;

        for (let i = 0; i < this.maxSlots; i++)
        {
            const x = startX + i * gap;

            const bg = scene.add.rectangle(x, barY, 54, 32, 0x1c1209, 0.95)
                .setStrokeStyle(1, 0x6a4a20)
                .setDepth(201)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true });

            const icon = scene.add.text(x, barY, '', {
                fontFamily: 'Georgia',
                fontSize: 20,
                color: '#f0d890'
            }).setOrigin(0.5).setDepth(202).setScrollFactor(0);

            const idx = i;

            bg.on('pointerdown', () => this._selectSlot(idx));
            bg.on('pointerover', () => {
                if (this.items[idx]) bg.setFillStyle(0x2a1b0a, 0.98);
            });
            bg.on('pointerout', () => {
                const selected = this.items[idx]?.key === this.selectedKey;
                bg.setFillStyle(selected ? 0x362008 : 0x1c1209, 0.95);
            });

            this._slotBgs.push(bg);
            this._slotIcons.push(icon);
        }

        // Help label + paid contextual help trigger.
        scene.add.text(w - 110, barY,
            'Clic pour lire', {
                fontFamily: 'Georgia',
                fontSize: 13,
                color: '#8a6030'
            }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

        const helpTrigger = scene.add.text(w - 34, barY, '?', {
            fontFamily: 'Georgia',
            fontSize: 20,
            color: '#d02828'
        })
            .setOrigin(0.5)
            .setDepth(202)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        helpTrigger.on('pointerover', () => helpTrigger.setColor('#ff4040'));
        helpTrigger.on('pointerout', () => helpTrigger.setColor('#d02828'));
        helpTrigger.on('pointerdown', () => this._handlePaidHelpClick());
    }

    _handlePaidHelpClick ()
    {
        if (!this.helpWarningShownOnce)
        {
            this.helpConfirmPending = true;
            this.helpWarningShownOnce = true;
            const costMinutes = this.scene.getPaidHelpCostMinutes?.() ?? 5;
            this.scene.updateMessage('Attention l\'aide te consomes ' + costMinutes + ' minutes de ton temps, reclique dessus pour confirmer');
            return;
        }

        if (this.helpConfirmPending)
        {
            this.helpConfirmPending = false;
            this.scene.requestPaidHelp?.();
            return;
        }

        this.scene.requestPaidHelp?.();
    }

    addItem (key, label, icon, hint)
    {
        if (this.items.length >= this.maxSlots) return false;
        if (this.items.find(it => it.key === key)) return false;

        this.items.push({ key, label, icon, hint });
        this._refreshSlots();
        this.scene.playSfx?.('pickup');

        this.scene.updateMessage(`Veronique saisit: ${label}`);
        return true;
    }

    removeItem (key)
    {
        const idx = this.items.findIndex(it => it.key === key);
        if (idx === -1) return null;

        const [removed] = this.items.splice(idx, 1);
        if (this.selectedKey === key)
        {
            this.selectedKey = null;
            this._closeItemPopup();
            this.scene.playSfx?.('place');
        }
        this._refreshSlots();
        return removed;
    }

    _refreshSlots ()
    {
        this._slotIcons.forEach((icon, i) => {
            const item = this.items[i];
            icon.setText(item ? item.icon : '');
        });

        this._slotBgs.forEach((bg, i) => {
            const item = this.items[i];
            bg.setStrokeStyle(item ? 2 : 1, item ? 0xeec050 : 0x6a4a20);
            const selected = item && item.key === this.selectedKey;
            bg.setFillStyle(selected ? 0x362008 : 0x1c1209, 0.95);
        });
    }

    _selectSlot (idx)
    {
        const item = this.items[idx];
        if (!item) return;

        if (this.selectedKey === item.key)
        {
            this.selectedKey = null;
            this._slotBgs[idx].setFillStyle(0x1c1209, 0.95);
            this._closeItemPopup();
            this.scene.playSfx?.('closeNote');
            this.scene.updateMessage('Objet repose dans le sac.');
        }
        else
        {
            this.selectedKey = item.key;
            this._slotBgs.forEach((bg, i) => {
                bg.setFillStyle(
                    this.items[i]?.key === this.selectedKey ? 0x362008 : 0x1c1209,
                    0.95
                );
            });
            this._openItemPopup(item);
            this.scene.playSfx?.('openNote');
            this.scene.updateMessage(item.hint);
        }
    }

    _openItemPopup (item)
    {
        this._closeItemPopup();

        const scene = this.scene;
        const w = scene.scale.width;
        const h = scene.scale.height;
        const isScribeTablet = item.key === 'cristal';
        const panelHeight = isScribeTablet ? 700 : 420;
        const panelY = isScribeTablet ? h / 2 - 8 : h / 2 - 18;

        const veil = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.45)
            .setDepth(180)
            .setScrollFactor(0);

        const panel = scene.add.rectangle(w / 2, panelY, 760, panelHeight, 0x1b120a, 0.9)
            .setStrokeStyle(2, 0xb07820)
            .setDepth(181)
            .setScrollFactor(0);

        const title = scene.add.text(w / 2, panelY - panelHeight / 2 + 30, item.label, {
            fontFamily: 'Georgia',
            fontSize: 26,
            color: '#f0d080'
        }).setOrigin(0.5).setDepth(182).setScrollFactor(0);

        const nodes = [veil, panel, title];

        if (!isScribeTablet)
        {
            const body = scene.add.text(w / 2, h / 2 - 8, item.hint, {
                fontFamily: 'Georgia',
                fontSize: 18,
                color: '#f3e3c4',
                align: 'left',
                wordWrap: { width: 700 }
            }).setOrigin(0.5).setDepth(182).setScrollFactor(0);

            const footer = scene.add.text(w / 2, h / 2 + 186,
                'Reclique sur l\'objet pour fermer', {
                    fontFamily: 'Georgia',
                    fontSize: 14,
                    color: '#caa06a'
                }).setOrigin(0.5).setDepth(182).setScrollFactor(0);

            nodes.push(body, footer);
            this._itemPopupNodes = nodes;
            return;
        }

        const lines = item.hint.split('\n');
        const glyphLinePattern = /^(Unites|Dizaines|Centaines|Milliers|Dix-milliers|Cent-milliers|Millions|Exemple 2026):\s*(.+)$/;
        const introLines = [];
        const glyphRows = [];

        lines.forEach(line => {
            const match = line.match(glyphLinePattern);
            if (match)
            {
                glyphRows.push({ label: match[1] + ':', glyph: match[2] });
            }
            else if (line.trim().length > 0)
            {
                introLines.push(line);
            }
        });

        const introText = scene.add.text(w / 2, panelY - panelHeight / 2 + 115, introLines.join('\n\n'), {
            fontFamily: 'Georgia',
            fontSize: 15,
            color: '#f3e3c4',
            align: 'left',
            lineSpacing: 4,
            wordWrap: { width: 700 }
        }).setOrigin(0.5, 0).setDepth(182).setScrollFactor(0);
        nodes.push(introText);

        const gridStartY = panelY - panelHeight / 2 + 352;
        glyphRows.forEach((row, idx) => {
            const y = gridStartY + idx * 40;
            const label = scene.add.text(w / 2 - 290, y, row.label, {
                fontFamily: 'Georgia',
                fontSize: 16,
                color: '#d8be8d',
                align: 'left'
            }).setOrigin(0, 0.5).setDepth(182).setScrollFactor(0);

            // Hieroglyphs are rendered much larger for readability.
            const glyph = scene.add.text(w / 2 - 82, y, row.glyph, {
                fontFamily: 'Georgia',
                fontSize: 42,
                color: '#f8e9c4',
                align: 'left'
            }).setOrigin(0, 0.5).setDepth(182).setScrollFactor(0);

            nodes.push(label, glyph);
        });

        const footer = scene.add.text(w / 2, panelY + panelHeight / 2 - 18,
            'Reclique sur l\'objet pour fermer', {
                fontFamily: 'Georgia',
                fontSize: 14,
                color: '#caa06a'
            }).setOrigin(0.5).setDepth(182).setScrollFactor(0);
        nodes.push(footer);

        this._itemPopupNodes = nodes;
    }

    _closeItemPopup ()
    {
        this._itemPopupNodes.forEach(node => node?.destroy());
        this._itemPopupNodes = [];
    }

    getSelected () { return this.selectedKey; }

    clearSelection ()
    {
        this.selectedKey = null;
        this._slotBgs.forEach(bg => bg.setFillStyle(0x1c1209, 0.95));
        this._closeItemPopup();
    }

    hasItem (key) { return !!this.items.find(it => it.key === key); }
}
