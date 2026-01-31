const { spawn } = require('child_process');
const path = require('path');

// Clean environment
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

console.log('Starting Electron with cleaned environment...');

// Find electron path
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd');

const child = spawn(electronPath, ['.'], {
    stdio: 'inherit',
    env,
    shell: true
});

child.on('exit', (code) => {
    process.exit(code);
});
