import { Resolver, Mutation, Arg, Ctx, UseMiddleware } from "type-graphql";
import { compare } from "bcryptjs";
import { User } from "../../entity/User";
import { MyContext } from "../../types/MyContext";
import { rateLimit } from "../middlewares/rateLimit";

@Resolver(User)
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  @UseMiddleware(rateLimit(3))
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext,
  ): Promise<User | { error: string } | undefined> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return {
        error: "user not found!",
      };
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      return {
        error: "invalid credentials!",
      };
    }

    if (!user.confirmed) {
      return {
        error: "not confirmed",
      };
    }

    if (req.session) {
      req.session.userId = user.id;
      return user;
    }

    return undefined;
  }
}