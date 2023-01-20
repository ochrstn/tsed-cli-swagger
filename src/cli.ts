#!/usr/bin/env node
import { CliCore } from "@tsed/cli-core";
import { HelloCommand } from "./commands/HelloCommand";
import { SwaggerJsonCmd } from "./commands/SwaggerJsonCmd";

CliCore.bootstrap({
  commands: [HelloCommand, SwaggerJsonCmd],
}).catch(console.error);
