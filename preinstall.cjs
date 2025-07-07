// 在Docker构建环境中跳过preinstall脚本
if (process.env.IS_DOCKER_BUILD) {
  console.log('Docker构建环境，跳过preinstall脚本');
  process.exit(0);
}

const { execSync } = require('child_process');

try {
  execSync('./setup.sh', { stdio: 'inherit' });
} catch (error) {
  console.warn('Setup脚本执行失败，但继续构建:', error.message);
}