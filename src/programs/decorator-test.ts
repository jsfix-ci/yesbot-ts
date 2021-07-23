import { Client, Message, MessageReaction, User, VoiceState } from "discord.js";
import {
  Command,
  CommandHandler,
  DiscordEvent,
  EventLocation,
} from "../event-distribution";
import { GuildMemberUpdateArgument } from "../event-distribution/events/guild-member-update";
import { MemberLeaveArgument } from "../event-distribution/events/member-leave";
import { VoiceStateChange } from "../event-distribution/events/voice-state-update";
import { createYesBotLogger } from "../log";

/**
 * Example of a stateless message handler (stateful: true missing in config).
 * Each time the command is run, a new instance is created so the counter resets.
 */
@Command({
  event: DiscordEvent.MESSAGE,
  description: "",
  trigger: "!test",
  channelNames: ["permanent-testing"],
})
export class DecoratorTest extends CommandHandler<DiscordEvent.MESSAGE> {
  called: number = 0;

  handle(): void {
    ++this.called;
    logger.info(`Called handler 1 ${this.called} times`);
  }
}

/**
 * Example of a stateful message handler.
 * Since this is kept as a singleton, the increasing counter is maintained.
 */
@Command({
  event: DiscordEvent.MESSAGE,
  description: "",
  trigger: "!test",
  stateful: true,
  channelNames: ["bot-output"],
  location: EventLocation.ANYWHERE,
  requiredRoles: ["Support"],
})
export class DecoratorTest2 extends CommandHandler<DiscordEvent.MESSAGE> {
  called: number = 0;

  async handle(message: Message): Promise<void> {
    ++this.called;
    logger2.info(`Called handler 2 ${this.called} times`);
  }
}

/**
 * Example of a DM only message handler.
 */
@Command({
  event: DiscordEvent.MESSAGE,
  description: "",
  trigger: "yeet",
  stateful: true,
  location: EventLocation.DIRECT_MESSAGE,
  channelNames: ["bot-output"],
})
export class DecoratorTest3 extends CommandHandler<DiscordEvent.MESSAGE> {
  called: number = 0;

  handle(message: Message): void {
    ++this.called;
    logger3.info(`Called handler 3 ${this.called} times`);
  }
}

/**
 * Example of a ReactionAdd Handler.
 */
@Command({
  event: DiscordEvent.REACTION_ADD,
  description: "What gives?",
  stateful: false,
  emoji: "🤓",
  channelNames: ["bot-output"],
})
export class DecoratorTest4 extends CommandHandler<DiscordEvent.REACTION_ADD> {
  handle(reaction: MessageReaction, user: User): void {
    logger4.info("Called handler 4");
  }
}

/**
 * Example of a MemberUpdate Handler
 */
@Command({
  event: DiscordEvent.GUILD_MEMBER_UPDATE,
  description: "Weee",
  roleNamesAdded: ["Yes Theory"],
  roleNamesRemoved: ["Seek Discomfort"],
})
export class DecoratorTest5 extends CommandHandler<DiscordEvent.GUILD_MEMBER_UPDATE> {
  handle(
    oldMember: GuildMemberUpdateArgument,
    newMember: GuildMemberUpdateArgument
  ): void {
    logger5.info("Called handler 5");
  }
}

/**
 * Example of a Ready Handler
 */
@Command({
  event: DiscordEvent.READY,
})
export class DecoratorTest6 extends CommandHandler<DiscordEvent.READY> {
  handle(client: Client): void {
    logger6.info("Called handler 6");
  }
}

/**
 * Example of a VoiceStateUpdate Handler on join and switch channel
 */
@Command({
  event: DiscordEvent.VOICE_STATE_UPDATE,
  changes: [VoiceStateChange.JOINED, VoiceStateChange.SWITCHED_CHANNEL],
})
export class DecoratorTest7 extends CommandHandler<DiscordEvent.VOICE_STATE_UPDATE> {
  handle(oldState: VoiceState, newState: VoiceState): void {
    logger7.info("Called handler 7");
  }
}

/**
 * Example of a MemberLeave Handler
 */
@Command({
  event: DiscordEvent.MEMBER_LEAVE,
})
export class DecoratorTest8 extends CommandHandler<DiscordEvent.MEMBER_LEAVE> {
  handle(member: MemberLeaveArgument): void {
    logger8.info("Called handler 8");
  }
}

const logger8 = createYesBotLogger("programs", DecoratorTest8.name);
const logger7 = createYesBotLogger("programs", DecoratorTest7.name);
const logger6 = createYesBotLogger("programs", DecoratorTest6.name);
const logger5 = createYesBotLogger("programs", DecoratorTest5.name);
const logger4 = createYesBotLogger("programs", DecoratorTest4.name);
const logger3 = createYesBotLogger("programs", DecoratorTest3.name);
const logger2 = createYesBotLogger("programs", DecoratorTest2.name);
const logger = createYesBotLogger("programs", DecoratorTest.name);
