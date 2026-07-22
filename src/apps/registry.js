import MyComputer from './MyComputer/MyComputer'
import Notepad from './Notepad/Notepad'
import ControlPanel from './ControlPanel/ControlPanel'
import BredExplorer from './BredExplorer/BredExplorer'
import BredStore from './BredStore/BredStore'
import VoxelCraft from './VoxelCraft/VoxelCraft'
import Game2048 from './Game2048/Game2048'
import Minesweeper from './Minesweeper/Minesweeper'
import Solitaire from './Solitaire/Solitaire'
import FlappyLoaf from './FlappyLoaf/FlappyLoaf'
import InstallWizard from './InstallWizard/InstallWizard'
import FakeApp from './InstallWizard/FakeApp'
import {
  IconMyComputer,
  IconDocument,
  IconGear,
  IconGlobe,
  IconStore,
  IconVoxel,
  IconExe,
} from '../components/icons/Icons'

// Central registry: appId -> window/app metadata used by the desktop, start
// menu, taskbar, and window manager. Adding a new fake app later just means
// adding one entry here.
export const APP_REGISTRY = {
  mycomputer: {
    title: 'My Computer',
    icon: '💻',
    DesktopIcon: IconMyComputer,
    component: MyComputer,
    defaultSize: { w: 560, h: 420 },
    singleton: true,
    showOnDesktop: true,
    showInStart: true,
  },
  notepad: {
    title: 'Notepad',
    icon: '📝',
    DesktopIcon: IconDocument,
    component: Notepad,
    defaultSize: { w: 520, h: 420 },
    singleton: false,
    showOnDesktop: false,
    showInStart: true,
  },
  controlpanel: {
    title: 'Control Panel',
    icon: '⚙️',
    DesktopIcon: IconGear,
    component: ControlPanel,
    defaultSize: { w: 560, h: 420 },
    minSize: { w: 440, h: 340 },
    singleton: true,
    showOnDesktop: false,
    showInStart: true,
  },
  bredexplorer: {
    title: 'BredExplorer',
    icon: '🌐',
    DesktopIcon: IconGlobe,
    component: BredExplorer,
    defaultSize: { w: 780, h: 560 },
    minSize: { w: 380, h: 300 },
    singleton: false,
    showOnDesktop: true,
    showInStart: true,
  },
  bredstore: {
    title: 'BredStore',
    icon: '🛒',
    DesktopIcon: IconStore,
    component: BredStore,
    defaultSize: { w: 760, h: 520 },
    minSize: { w: 520, h: 380 },
    singleton: true,
    showOnDesktop: true,
    showInStart: true,
  },
  voxelcraft: {
    title: 'Voxel Craft',
    icon: '⛏️',
    DesktopIcon: IconVoxel,
    component: VoxelCraft,
    defaultSize: { w: 820, h: 560 },
    minSize: { w: 400, h: 300 },
    singleton: false,
    showOnDesktop: false,
    showInStart: false,
  },
  game2048: {
    title: '2048',
    icon: '🔢',
    component: Game2048,
    defaultSize: { w: 380, h: 520 },
    minSize: { w: 340, h: 440 },
    singleton: false,
    showOnDesktop: false,
    showInStart: false,
  },
  minesweeper: {
    title: 'BredSweeper',
    icon: '💣',
    component: Minesweeper,
    defaultSize: { w: 420, h: 480 },
    minSize: { w: 340, h: 360 },
    singleton: false,
    showOnDesktop: false,
    showInStart: false,
  },
  solitaire: {
    title: 'BredCard Solitaire',
    icon: '🃏',
    component: Solitaire,
    defaultSize: { w: 720, h: 560 },
    minSize: { w: 560, h: 420 },
    singleton: false,
    showOnDesktop: false,
    showInStart: false,
  },
  flappyloaf: {
    title: 'Flappy Loaf',
    icon: '🍞',
    component: FlappyLoaf,
    defaultSize: { w: 400, h: 620 },
    minSize: { w: 400, h: 620 },
    singleton: false,
    showOnDesktop: false,
    showInStart: false,
  },
  installwizard: {
    title: 'Install Program',
    icon: '📀',
    DesktopIcon: IconExe,
    component: InstallWizard,
    defaultSize: { w: 520, h: 380 },
    minSize: { w: 480, h: 360 },
    resizable: false,
    singleton: false,
    showOnDesktop: true,
    showInStart: false,
  },
  fakeApp: {
    title: 'Program',
    icon: '📦',
    component: FakeApp,
    defaultSize: { w: 420, h: 260 },
    singleton: false,
    showOnDesktop: false,
    showInStart: false,
  },
}
