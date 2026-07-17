import React from 'react';
import { Box } from 'ink';
import type { View, OutputEntry, GroupMenuItem } from '../App.js';
import HomeView from '../views/HomeView.js';
import GroupMenuView from '../views/GroupMenuView.js';
import CommandOutput from '../views/CommandOutput.js';

interface Props {
  view: View;
  outputs: OutputEntry[];
  groupName: string | null;
  groupCommands: GroupMenuItem[];
  selectedCommand: string | null;
  onSelectCommand: (name: string) => void;
}

export default function Content({
  view,
  outputs,
  groupName,
  groupCommands,
  selectedCommand,
  onSelectCommand,
}: Props) {
  return (
    <Box flexGrow={1} flexDirection="column" paddingX={1} paddingY={0} minHeight={5}>
      {view === 'home' ? <HomeView /> : null}
      {view === 'group-menu' ? (
        <GroupMenuView
          groupName={groupName || ''}
          commands={groupCommands}
          onSelect={onSelectCommand}
        />
      ) : null}
      {view === 'output' ? <CommandOutput outputs={outputs} selectedCommand={selectedCommand} /> : null}
    </Box>
  );
}
