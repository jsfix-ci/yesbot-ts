import Tools from "../common/tools";
import { setTimeout } from "timers";
import prisma from "../prisma";
import { ReactionRole } from "@yes-theory-fam/database/client";
import { createYesBotLogger } from "../log";

type JSONReactionRole = Omit<ReactionRole, "id">;

const logger = createYesBotLogger("scripts", "ReactionRoleObjectsToDataBase");

async function importReactionRoleObjects() {
  const reactionRoles = (<unknown>(
    await Tools.resolveFile("reactRoleObjects")
  )) as JSONReactionRole[];

  const existingReactionRoles = await prisma.reactionRole.findMany();
  const existingReactionRolesChannelMsgReaction = existingReactionRoles.map(
    (reactionRole) => [
      reactionRole.channelId,
      reactionRole.messageId,
      reactionRole.reaction,
    ]
  );

  const toCreateSource: JSONReactionRole[] = reactionRoles
    .filter(
      ({ channelId, messageId, reaction }) =>
        !existingReactionRolesChannelMsgReaction.includes([
          channelId,
          messageId,
          reaction,
        ])
    )
    .map((reactionRole) => ({
      channelId: reactionRole.channelId,
      messageId: reactionRole.messageId,
      reaction: reactionRole.reaction,
      roleId: reactionRole.roleId,
    }));

  let toCreate2: JSONReactionRole[] = [];
  for (let i = 0; i < toCreateSource.length; i++) {
    const current = toCreateSource[i];
    if (
      toCreate2.find(
        (existing) =>
          existing.channelId === current.channelId &&
          existing.messageId === current.messageId &&
          (existing.reaction === current.reaction ||
            existing.roleId === current.roleId)
      )
    ) {
      logger.warn(
        `Skipping duplicate reactionRoleObject: ${current.messageId}+${current.reaction} for chan ${current.channelId}, using existing.`
      );
      continue;
    }
    if (
      !current.channelId ||
      !current.messageId ||
      !current.reaction ||
      !current.roleId
    ) {
      logger.warn("Skipping item with missing required parameters");
      continue;
    }
    toCreate2.push(current);
  }

  logger.info(
    `Found ${toCreate2.length} items to import. Skipping ${existingReactionRoles.length} existing items.`
  );

  if (toCreate2.length === 0) {
    logger.info("No new items to insert.");
    return;
  }

  try {
    await prisma.reactionRole.createMany({ data: toCreate2 });
  } catch (err) {
    logger.info("Failed to mass-import reaction role objects. Error: ", err);
  }

  logger.info("Done");
  return;
}

const timeout =
  (process.env.YESBOT_SCRIPT_TIMEOUT &&
    parseInt(process.env.YESBOT_SCRIPT_TIMEOUT, 10)) ||
  1000;
logger.info(
  `Waiting ${timeout}ms before starting import. Configure with environment variable YESBOT_SCRIPT_TIMEOUT=${timeout}`
);
setTimeout(importReactionRoleObjects, timeout);
