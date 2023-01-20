import { Controller, Inject } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { Get, Returns } from "@tsed/schema";
import { PostEntity } from "../../entities/PostEntity";

@Controller("/hello-world")
export class HelloWorldController {
  constructor(
    @Inject(PostEntity) private postRepo: MongooseModel<PostEntity>
  ) {}

  @Get("/")
  @Returns(200, PostEntity)
  get() {
    return "hello";
  }
}
