import Tools from "../common/tools";
import { BirthdayManagerTools } from "../programs";
import { setTimeout } from "timers";
import prisma from "../prisma";
import { createYesBotLogger } from "../log";

interface JSONBirthday {
  id: string;
  date: string;
}

const logger = createYesBotLogger("scripts", "BirthdaysToDatabase");

async function importBirthdaysToDatabase() {
  const birthdays = (<unknown>(
    await Tools.resolveFile("birthdayMembers")
  )) as JSONBirthday[];

  const existingBirthdays = await prisma.birthday.findMany();
  const existingBirthdayUsers = existingBirthdays.map((b) => b.userId);

  const toCreate = birthdays
    .filter(({ id }) => !existingBirthdayUsers.includes(id))
    .map(({ id, date }) => ({
      userId: id,
      birthdate: BirthdayManagerTools.getUserBirthdate(date),
    }));

  logger.info(
    `Found ${toCreate.length} birthdays to import. Skipping ${existingBirthdayUsers.length} existing birthdays.`
  );

  if (toCreate.length === 0) {
    logger.info("No new birthdays to insert.");
    return;
  }

  try {
    await prisma.birthday.createMany({ data: toCreate });
  } catch (err) {
    logger.info("Failed to mass-import birthdays. Error: ", err);
  }

  logger.info("Done");
  return;
}

setTimeout(importBirthdaysToDatabase, 1000);
