const { spawn } = require('child_process');

function run(cmd, args) {
    return new Promise((resolve) => {
        const env = { ...process.env };
        delete env.ELECTRON_RUN_AS_NODE;

        const child = spawn(cmd, args, {
            stdio: 'inherit',
            env,
            shell: true
        });

        child.on('exit', resolve);
    });
}

async function main() {
    console.log('Building for production...');
    await run('npm', ['run', 'build']);
    console.log('Packaging Electron app...');
    await run('npx', ['electron-builder']);
}

main();
