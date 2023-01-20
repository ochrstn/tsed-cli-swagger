import fs from "fs";

import { CliFs, Command, CommandProvider, Inject } from "@tsed/cli-core";
import { InjectorService } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { SwaggerService } from "@tsed/swagger";

import { Server } from "../Server";

interface SwaggerCtx {
  output: string;
}

@Command({
  name: "swagger",
  description: "Generate the swagger.json spec only",
  options: {
    "-o, --output <output>": {
      required: true,
      type: String,
      description: "Path to generate files",
      defaultValue: ".",
    },
  },
})
export class SwaggerJsonCmd implements CommandProvider {
  @Inject()
  injector: InjectorService;

  @Inject()
  protected fs: CliFs;

  async $exec($ctx: SwaggerCtx) {
    await this.generate($ctx);
    process.exit(0);
  }

  private async generate($ctx: SwaggerCtx) {
    console.log("Bootstrap Server ...");
    const platform = await PlatformExpress.bootstrap(Server, {
      logger: { level: "off" },
      mongoose: undefined, // does not work
    });

    console.log("Settings:", platform.settings);

    const swaggerService =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      platform.injector.get<SwaggerService>(SwaggerService)!;
    const confs = platform.settings.get("swagger", []);

    console.log(`Found ${confs.length} swagger config(s)`);

    await this.fs.ensureDir($ctx.output);

    const promises = confs.map(async (conf) => {
      const spec = await swaggerService.getOpenAPISpec(conf);

      await this.generateFromSpec(spec, $ctx);
    });

    await Promise.all(promises);
  }

  private async generateFromSpec(spec: any, $ctx: SwaggerCtx) {
    const filename = `${$ctx.output}/spec.json`;
    console.log(`Generate ${filename} ...`);
    fs.writeFileSync(filename, JSON.stringify(spec, null, 2), {
      encoding: "utf-8",
    });
    console.log(`... done`);
    return Promise.resolve();
  }
}
