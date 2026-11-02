import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { color } from './theme';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: color.dusk,
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
  scene: [BootScene],
});

// Pausar al ocultar la pestaña.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.loop.sleep();
  else game.loop.wake();
});

if (import.meta.env.DEV) Object.assign(window, { game });
