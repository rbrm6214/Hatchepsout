import { EventBus } from '../EventBus';
import { DIFFICULTY, difficultyLabel, getStoredDifficulty, setStoredDifficulty } from '../GameSettings';
import { Scene } from 'phaser';

export class OptionsMenu extends Scene
{
    constructor ()
    {
        super('OptionsMenu');
    }

    create ()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#120d08');

        this.add.rectangle(width / 2, height / 2, width - 120, height - 140, 0x2b1c11, 0.85)
            .setStrokeStyle(2, 0xcaa267);

        this.add.text(width / 2, 170, 'OPTIONS', {
            fontFamily: 'Georgia',
            fontSize: 50,
            color: '#f3d8a0'
        }).setOrigin(0.5);

        this.add.text(width / 2, 300, 'Choisis le niveau de difficulte', {
            fontFamily: 'Georgia',
            fontSize: 28,
            color: '#ead8b0',
            align: 'center'
        }).setOrigin(0.5);

        let currentDifficulty = getStoredDifficulty();
        this.registry.set('difficulty', currentDifficulty);

        const status = this.add.text(width / 2, 350, 'Actuel: ' + difficultyLabel(currentDifficulty), {
            fontFamily: 'Georgia',
            fontSize: 24,
            color: '#f2dfb5',
            align: 'center'
        }).setOrigin(0.5);

        const createDifficultyButton = (x, y, label, value) => {
            const btn = this.add.rectangle(x, y, 220, 56, 0x3a2a1a, 0.95)
                .setStrokeStyle(2, 0xd7b574)
                .setInteractive({ useHandCursor: true });
            const txt = this.add.text(x, y, label, {
                fontFamily: 'Georgia',
                fontSize: 30,
                color: '#f5e4be'
            }).setOrigin(0.5);

            const refresh = () => {
                const active = currentDifficulty === value;
                btn.setFillStyle(active ? 0x5a3f24 : 0x3a2a1a, 0.95);
                txt.setColor(active ? '#fff3d0' : '#f5e4be');
            };

            btn.on('pointerdown', () => {
                currentDifficulty = setStoredDifficulty(value);
                this.registry.set('difficulty', currentDifficulty);
                status.setText('Actuel: ' + difficultyLabel(currentDifficulty));
                refreshAll();
            });

            btn.on('pointerover', () => {
                if (currentDifficulty !== value) btn.setFillStyle(0x4a3522, 0.95);
            });

            btn.on('pointerout', refresh);

            return refresh;
        };

        const refreshers = [
            createDifficultyButton(width / 2 - 250, 430, '1 - Facile', DIFFICULTY.EASY),
            createDifficultyButton(width / 2, 430, '2 - Normal', DIFFICULTY.NORMAL),
            createDifficultyButton(width / 2 + 250, 430, '3 - Difficile', DIFFICULTY.HARD)
        ];
        const refreshAll = () => refreshers.forEach(fn => fn());
        refreshAll();

        const back = this.add.rectangle(width / 2, height - 120, 260, 56, 0x3a2a1a, 0.95)
            .setStrokeStyle(2, 0xd7b574)
            .setInteractive({ useHandCursor: true });

        const backText = this.add.text(width / 2, height - 120, 'Retour', {
            fontFamily: 'Georgia',
            fontSize: 32,
            color: '#f5e4be'
        }).setOrigin(0.5);

        back.on('pointerover', () => {
            back.setFillStyle(0x4a3522, 0.95);
            backText.setColor('#fff3d0');
        });

        back.on('pointerout', () => {
            back.setFillStyle(0x3a2a1a, 0.95);
            backText.setColor('#f5e4be');
        });

        back.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        EventBus.emit('current-scene-ready', this);
    }
}