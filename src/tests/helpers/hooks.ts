import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

let application: ChildProcessWithoutNullStreams;

export async function beforeAll(): Promise<void> {
  application = spawn('npm', ['run', 'dev'], { env: process.env });

  return new Promise((resolve) => {
    application.stdout.on('data', (data: Buffer) => {
      if (data.toString().trim() === 'Application is up and running!') {
        resolve();
      }
    });
  });
}

export async function afterAll(): Promise<void> {
  application.kill();
  process.exit();
}
