import * as Phaser from 'phaser';
import { es } from '../copy/es';
import { color, font, renderResolution } from '../theme';

/** Prueba de humo: muestra el título sobre el color de fondo del juego. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const { width, height } = this.scale;
    const title = this.add
      .text(width / 2, height / 2, es.title, {
        fontFamily: font.display,
        fontSize: `${Math.round(Math.min(width, 430) * 0.085)}px`,
        fontStyle: 'bold',
        color: color.spore,
        align: 'center',
        wordWrap: { width: width - 32 },
        resolution: renderResolution(),
      })
      .setOrigin(0.5);

    this.scale.on('resize', (size: Phaser.Structs.Size) => {
      title.setPosition(size.width / 2, size.height / 2);
      title.setWordWrapWidth(size.width - 32);
    });
  }
}
