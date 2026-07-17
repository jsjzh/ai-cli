import inquirer from 'inquirer';

interface Choice {
  name: string;
  value: string;
}

export async function createController(
  message: string,
  choices: Choice[],
  action: string | undefined,
  handlers: Record<string, () => Promise<void>>,
): Promise<void> {
  if (!action) {
    const { picked } = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'picked',
        message,
        choices,
      },
    ]);
    action = picked;
  }
  await handlers[action!]?.();
}
