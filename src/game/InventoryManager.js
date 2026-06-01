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
        this._slotStartX = 154;
        this._slotGap = 62;
        this._slotBarY = 748;
        this._dragCandidate = null;
        this._dragState = null;
        this._createHUD();
        this._bindDragHandlers();
    }

    _createHUD ()
    {
        const scene = this.scene;
        const w = scene.scale.width;
        const barY = this._slotBarY;

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

        const startX = this._slotStartX;
        const gap = this._slotGap;

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

            bg.on('pointerdown', pointer => this._onSlotPointerDown(pointer, idx));
            bg.on('pointerover', () => {
                if (this._dragState?.active) return;
                if (this.items[idx]) bg.setFillStyle(0x2a1b0a, 0.98);
            });
            bg.on('pointerout', () => {
                if (this._dragState?.active) return;
                const selected = this.items[idx]?.key === this.selectedKey;
                bg.setFillStyle(selected ? 0x362008 : 0x1c1209, 0.95);
            });

            icon.setInteractive({ useHandCursor: true });
            icon.on('pointerdown', pointer => this._onSlotPointerDown(pointer, idx));

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

    _bindDragHandlers ()
    {
        const input = this.scene.input;
        input.on('pointermove', pointer => this._onGlobalPointerMove(pointer));
        input.on('pointerup', pointer => this._onGlobalPointerUp(pointer));
        input.on('pointerupoutside', pointer => this._onGlobalPointerUp(pointer));
    }

    _isSamePointer (pointer, pointerId)
    {
        if (pointerId === undefined || pointerId === null) return true;
        if (!pointer || pointer.id === undefined || pointer.id === null) return true;
        return pointer.id === pointerId;
    }

    _onSlotPointerDown (pointer, idx)
    {
        if (!this.items[idx]) return;

        this._dragCandidate = {
            index: idx,
            pointerId: pointer.id,
            startX: pointer.x,
            startY: pointer.y
        };
    }

    _onGlobalPointerMove (pointer)
    {
        if (this._dragState?.active)
        {
            if (!this._isSamePointer(pointer, this._dragState.pointerId)) return;
            this._dragState.icon.setPosition(pointer.x, this._slotBarY);
            this._updateDragInsertionPreview(pointer.x);
            return;
        }

        if (!this._dragCandidate) return;
        if (!this._isSamePointer(pointer, this._dragCandidate.pointerId)) return;

        const dx = pointer.x - this._dragCandidate.startX;
        const dy = pointer.y - this._dragCandidate.startY;
        const movedEnough = Math.abs(dx) > 10 || Math.abs(dy) > 10;
        if (!movedEnough) return;

        const fromIndex = this._dragCandidate.index;
        const item = this.items[fromIndex];
        const icon = this._slotIcons[fromIndex];
        if (!item || !icon) return;

        this._dragState = {
            active: true,
            pointerId: pointer.id,
            fromIndex,
            insertIndex: fromIndex,
            icon,
            originalX: icon.x,
            originalY: icon.y
        };

        this._dragCandidate = null;
        icon.setDepth(260);
        this._updateDragInsertionPreview(pointer.x);
    }

    _onGlobalPointerUp (pointer)
    {
        if (this._dragState?.active)
        {
            if (!this._isSamePointer(pointer, this._dragState.pointerId)) return;

            // Re-evaluate target slot at release position to avoid stale preview index.
            this._updateDragInsertionPreview(pointer.x);

            const fromIndex = this._dragState.fromIndex;
            const insertIndex = this._dragState.insertIndex;

            this._dragState.icon.setDepth(202);

            this._clearDragPreview();
            this._dragState = null;

            if (insertIndex !== fromIndex)
            {
                this._moveItem(fromIndex, insertIndex);
                this._refreshSlots();
                this.scene.playSfx?.('pickup');
            }

            this._animateIconsToSlotPositions();
            return;
        }

        if (!this._dragCandidate) return;
        if (!this._isSamePointer(pointer, this._dragCandidate.pointerId)) return;

        const idx = this._dragCandidate.index;
        this._dragCandidate = null;
        this._selectSlot(idx);
    }

    _updateDragInsertionPreview (pointerX)
    {
        if (!this._dragState?.active) return;

        const maxIndex = Math.max(0, this.items.length - 1);
        const rawIndex = Math.round((pointerX - this._slotStartX) / this._slotGap);
        const insertIndex = Math.max(0, Math.min(rawIndex, maxIndex));
        this._dragState.insertIndex = insertIndex;

        this._animateDragProjection();

        this._slotBgs.forEach((bg, i) => {
            const hasItem = !!this.items[i];
            const selected = hasItem && this.items[i].key === this.selectedKey;
            let fill = selected ? 0x362008 : 0x1c1209;
            let alpha = 0.95;

            if (hasItem && i === insertIndex)
            {
                fill = 0x4a2f10;
                alpha = 1;
            }

            if (i === this._dragState.fromIndex)
            {
                fill = 0x23170c;
                alpha = 0.7;
            }

            bg.setFillStyle(fill, alpha);
        });
    }

    _slotXForIndex (index)
    {
        return this._slotStartX + index * this._slotGap;
    }

    _projectedIndexForDrag (slotIndex, fromIndex, insertIndex)
    {
        if (slotIndex === fromIndex) return insertIndex;

        if (insertIndex > fromIndex)
        {
            if (slotIndex > fromIndex && slotIndex <= insertIndex) return slotIndex - 1;
            return slotIndex;
        }

        if (insertIndex < fromIndex)
        {
            if (slotIndex >= insertIndex && slotIndex < fromIndex) return slotIndex + 1;
            return slotIndex;
        }

        return slotIndex;
    }

    _animateDragProjection ()
    {
        if (!this._dragState?.active) return;

        const fromIndex = this._dragState.fromIndex;
        const insertIndex = this._dragState.insertIndex;

        for (let i = 0; i < this.items.length; i++)
        {
            if (i === fromIndex) continue;
            const icon = this._slotIcons[i];
            if (!icon) continue;

            const projected = this._projectedIndexForDrag(i, fromIndex, insertIndex);
            const targetX = this._slotXForIndex(projected);
            if (Math.abs(icon.x - targetX) < 1) continue;

            this.scene.tweens.killTweensOf(icon);
            this.scene.tweens.add({
                targets: icon,
                x: targetX,
                y: this._slotBarY,
                duration: 85,
                ease: 'Sine.easeOut'
            });
        }
    }

    _animateIconsToSlotPositions ()
    {
        this._slotIcons.forEach((icon, i) => {
            if (!icon) return;
            const targetX = this._slotXForIndex(i);
            const targetY = this._slotBarY;
            if (Math.abs(icon.x - targetX) < 1 && Math.abs(icon.y - targetY) < 1)
            {
                icon.setPosition(targetX, targetY);
                return;
            }

            this.scene.tweens.killTweensOf(icon);
            this.scene.tweens.add({
                targets: icon,
                x: targetX,
                y: targetY,
                duration: 120,
                ease: 'Sine.easeOut'
            });
        });
    }

    _clearDragPreview ()
    {
        this._slotBgs.forEach((bg, i) => {
            const selected = this.items[i]?.key === this.selectedKey;
            bg.setFillStyle(selected ? 0x362008 : 0x1c1209, 0.95);
        });
    }

    _moveItem (fromIndex, toIndex)
    {
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || fromIndex >= this.items.length) return;
        if (toIndex < 0 || toIndex >= this.items.length) return;

        const [item] = this.items.splice(fromIndex, 1);
        this.items.splice(toIndex, 0, item);
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
