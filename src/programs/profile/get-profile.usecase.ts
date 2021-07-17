import { UseCase } from "../../utils/usecase";
import { GuildEmoji, GuildMember, Message, MessageEmbed } from "discord.js";
import Tools from "../../common/tools";
import { CountryRoleFinder } from "../../utils/country-role-finder";
import { getUserBirthday } from "../birthday-manager";
import prisma from "../../prisma";
import { FormatBirthday } from "../../utils/format-birthday";

interface GetProfileUsecaseInput {
  requestedMember: GuildMember;
  message: Message;
}

export class GetProfileUsecase
  implements UseCase<GetProfileUsecaseInput, void>
{
  private static instance: GetProfileUsecase;

  private constructor() {}

  public static get Instance() {
    return this.instance || (this.instance = new this());
  }

  private static async checkMemberAvailable(input: GetProfileUsecaseInput) {
    if (!input.requestedMember) {
      await Tools.handleUserError(
        input.message,
        "I couldn't find that member in this server!"
      );
      return;
    }
  }

  private static async getProfileData(
    countries: string[],
    member: GuildMember
  ) {
    const countryString = countries.join("\n");
    const yesEmoji = member.guild.emojis.cache.find((e) => e.name == "yes");
    const birthdayString = FormatBirthday.format(
      await getUserBirthday(member.user.id)
    );
    const memberWithGroups = await GetProfileUsecase.getMemberGroups(member);
    const groupString = memberWithGroups?.userGroupMembersGroupMembers
      .map(({ userGroup: { name } }) => name)
      .join(", ");
    const joinDate = member.joinedAt.toDateString();
    return { countryString, yesEmoji, birthdayString, groupString, joinDate };
  }

  private static buildEmbedMessage(
    member: GuildMember,
    yesEmoji: GuildEmoji,
    countryString: string,
    birthdayString: string,
    groupString: any,
    joinDate: string
  ) {
    const profileEmbed = new MessageEmbed();

    profileEmbed.setThumbnail(member.user.avatarURL());
    profileEmbed.setTitle(
      yesEmoji.toString() +
        " " +
        member.user.username +
        "#" +
        member.user.discriminator
    );
    profileEmbed.setColor(member.roles.color.color);
    profileEmbed.addField("Hi! My name is:", member.displayName, true);
    profileEmbed.addField("Where I'm from:", countryString, true);
    profileEmbed.addField("\u200b", "\u200b");
    profileEmbed.addField("Joined on:", joinDate, true);
    profileEmbed.addField("Birthday:", birthdayString, true);
    profileEmbed.addField("Groups:", groupString || "None", true);
    profileEmbed.setFooter(
      "Thank you for using the Yes Theory Fam Discord Server!"
    );

    return profileEmbed;
  }

  private static async getMemberGroups(member: GuildMember) {
    return await prisma.groupMember.findFirst({
      where: {
        id: member.id,
      },
      include: {
        userGroupMembersGroupMembers: {
          include: { userGroup: { select: { name: true } } },
        },
      },
    });
  }

  async handle(input: GetProfileUsecaseInput): Promise<void> {
    await GetProfileUsecase.checkMemberAvailable(input);
    const profileEmbed = await this.getProfileEmbed(input.requestedMember);
    await input.message.channel.send(profileEmbed);
  }

  private getProfileEmbed = async (
    member: GuildMember
  ): Promise<MessageEmbed | string> => {
    const countries = this.getCountries(member);

    if (countries.length === 0) {
      return "That user isn't registered here!";
    }

    const { countryString, yesEmoji, birthdayString, groupString, joinDate } =
      await GetProfileUsecase.getProfileData(countries, member);

    return GetProfileUsecase.buildEmbedMessage(
      member,
      yesEmoji,
      countryString,
      birthdayString,
      groupString,
      joinDate
    );
  };

  private getCountries(member: GuildMember) {
    return member.roles.cache
      .filter((role) => {
        return CountryRoleFinder.isCountryRole(role.name, true);
      })
      .map(({ name }) => name);
  }
}
