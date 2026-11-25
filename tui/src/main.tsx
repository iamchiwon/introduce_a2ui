import React from 'react';
import {render} from 'ink';
import {App} from './app.js';

render(<App initial={process.argv[2]} />);
