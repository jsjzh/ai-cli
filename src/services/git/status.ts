import { exec } from '../../utils/exec.js';

export default async function status() {
  const output = exec('git status', { encoding: 'utf8' });
  console.log(`\n工作区状态:\n`);
  console.log(output);
}
