import { DenonConfig } from 'https://deno.land/x/denon@2.4.7/mod.ts';
import { config } from 'https://deno.land/x/dotenv/mod.ts';

// config = {
//   PORT: 8888
// }

const denonConfig: DenonConfig = {
  scripts: {
    start: {
      cmd: 'deno run server.ts',
      desc: 'run deno server using Oak',
      allow: ['env', 'net'],
      env: config(),
    },
  },
};

export default denonConfig;
