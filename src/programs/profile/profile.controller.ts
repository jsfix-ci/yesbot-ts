import {
  Command,
  CommandHandler,
  DiscordEvent,
} from "../../event-distribution";
import { ChatNames } from "../../collections/chat-names";
import { Message } from "discord.js";
import { GetProfileUsecase } from "./get-profile.usecase";
import { createYesBotLogger } from "../../log";

@Command({
  event: DiscordEvent.MESSAGE,
  description: "",
  trigger: "!profile",
  requiredRoles: [],
  channelNames: [ChatNames.BOT_COMMANDS],
})
export class ProfileController extends CommandHandler<DiscordEvent.MESSAGE> {
  private getProfileUsecase: GetProfileUsecase;

  constructor() {
    super();
    this.getProfileUsecase = new GetProfileUsecase();
  }

  async handle(message: Message): Promise<void> {
    logger.debug(`starting !profile command`, message);
    const requestedUser = message.mentions.users.first() || message.member.user;
    const requestedMember = message.guild.member(requestedUser);

    await this.getProfileUsecase.handle({ requestedMember, message });
  }
}

const logger = createYesBotLogger("programs", ProfileController.name);
