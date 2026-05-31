import { EventBus } from '../EventBus';
import { setBonusUnlocked } from '../GameSettings';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    outcome;
    timeRemainingSeconds;

    constructor ()
    {
        super('GameOver');
        this.outcome = 'success';
        this.timeRemainingSeconds = 0;
    }

    init (data)
    {
        this.outcome = data?.outcome ?? 'success';
        this.timeRemainingSeconds = data?.timeRemainingSeconds ?? 0;
    }

    formatScoreTime (seconds)
    {
        const safe = Math.max(0, Math.floor(seconds ?? 0));
        const mins = Math.floor(safe / 60);
        const secs = safe % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    create ()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        const isCollapse = this.outcome === 'collapse';
        if (!isCollapse)
        {
            setBonusUnlocked(true);
        }
        const panelColor = isCollapse ? 0x44221a : 0x2f3d1f;
        const panelStroke = isCollapse ? 0xf1a974 : 0xc7d489;
        const title = isCollapse
            ? 'Le temple s\'effondre !'
            : 'Bravo Véronique, tu es sortie du tombeau, mais nous ne savons pas encore où tu vas arriver...';
        const description = isCollapse
            ? 'Le chrono a atteint 0:00.\nUn éboulement du temple bloque toute issue.'
            : 'Les sceaux d\'Hatchepsout sont brisés\nCette victoire t\'a débloquée une section Bonus (pour la retrouver, utilises ton année de naissance)\nScore (temps restant): ' + this.formatScoreTime(this.timeRemainingSeconds) + '\nBonne Fête Maman, prend vites en photo cet écran et envoie la moi ^^';

        this.cameras.main.setBackgroundColor('#1a2310');

        this.add.rectangle(width / 2, height / 2, width - 120, height - 160, panelColor, 0.8)
            .setStrokeStyle(3, panelStroke);

        this.add.text(width / 2, 250, title, {
            fontFamily: 'Georgia',
            fontSize: isCollapse ? 52 : 36,
            color: '#eff8c4',
            stroke: '#1d240f',
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: width - 220 }
        }).setOrigin(0.5);

        this.add.text(width / 2, 400,
            description, {
                fontFamily: 'Georgia',
                fontSize: isCollapse ? 27 : 25,
                color: '#dce4b5',
                align: 'center',
                wordWrap: { width: width - 260 }
            }
        ).setOrigin(0.5);

        const button = this.add.rectangle(width / 2, 580, 330, 58, 0x3a4a24, 0.95)
            .setStrokeStyle(2, 0xdce8a6)
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(width / 2, 580, 'Retour à l\'écran titre', {
            fontFamily: 'Georgia',
            fontSize: 30,
            color: '#f4ffd2'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setFillStyle(0x4b5f2f, 0.95);
            label.setColor('#ffffff');
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x3a4a24, 0.95);
            label.setColor('#f4ffd2');
        });

        button.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        EventBus.emit('current-scene-ready', this);
    }
}
