import pc from 'picocolors';
import { exec } from '../../utils/exec';

export default async function status() {
  const output = exec('git status', { encoding: 'utf8' });
  console.log(pc.bold(pc.cyan(`\n工作区状态:\n`)));
  console.log(output);
}
