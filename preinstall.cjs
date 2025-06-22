import { execSync } from 'child_process';

if (!process.env.IS_DOCKER_BUILD) {
  require('child_process').execSync('./setup.sh', { stdio: 'inherit' });
}