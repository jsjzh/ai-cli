import React from 'react';
import { render } from 'ink';
import App from '../tui/App.js';

export default async function tuiController() {
  const { waitUntilExit } = render(React.createElement(App));
  await waitUntilExit();
}
