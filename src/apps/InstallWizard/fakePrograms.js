export const FAKE_PROGRAMS = [
  { name: 'ToastMaster Pro 2003', icon: '🍞', folder: 'ToastMasterPro' },
  { name: 'CrumbCleaner Deluxe', icon: '🧹', folder: 'CrumbCleaner' },
  { name: 'Loaf Optimizer XP', icon: '📈', folder: 'LoafOptimizer' },
  { name: 'Butter Toolbar 4.0', icon: '🧈', folder: 'ButterToolbar' },
  { name: 'Gluten Defender Antivirus', icon: '🛡️', folder: 'GlutenDefender' },
]

export function randomProgram() {
  return FAKE_PROGRAMS[Math.floor(Math.random() * FAKE_PROGRAMS.length)]
}
