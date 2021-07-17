import {
  Command,
  CommandHandler,
  DiscordEvent,
} from "../../event-distribution";
import { ChatNames } from "../../collections/chat-names";
import { Message } from "discord.js";
import { GetProfileUsecase } from "./get-profile.usecase";

@Command({
  event: DiscordEvent.MESSAGE,
  description: "",
  trigger: "!profile",
  requiredRoles: [],
  channelNames: [ChatNames.BOT_COMMANDS],
})
export class ProfileController extends CommandHandler<DiscordEvent.MESSAGE> {
  async handle(message: Message): Promise<void> {
    const requestedUser = message.mentions.users.first() || message.member.user;
    const requestedMember = message.guild.member(requestedUser);

    await GetProfileUsecase.Instance.handle({ requestedMember, message });
  }
}
