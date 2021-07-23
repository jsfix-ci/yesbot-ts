import { GetProfileUsecase } from "../../../src/programs/profile/get-profile.usecase";
import MockDiscord from "../../mocks";

describe("GithubReleaseNotesUsecase", () => {
  let getProfileUsecase: GetProfileUsecase;
  const mockDiscord = new MockDiscord();

  beforeEach(() => {
    getProfileUsecase = new GetProfileUsecase();
  });

  xit("should get the countries", () => {
    console.log(
      JSON.stringify(
        getProfileUsecase["getCountries"](mockDiscord.getGuildMember())
      )
    );
  });
});
