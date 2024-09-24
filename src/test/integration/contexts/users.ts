import { type TestDbType } from "../fixtures/db-fixtures";
import { buildUser } from "../fixtures/user-fixture";

export const withValidUser = async (db: TestDbType) => {
  return buildUser({ db, name: "Good Smith", email: "goodsmith@example.com" });
};
