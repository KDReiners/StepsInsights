import { User } from "../models/User";

export class UserController {
  static getUsers(): User[] {
    return [
      new User(1, "Alice", "alice@example.com"),
      new User(2, "Bob", "bob@example.com"),
      new User(3, "Bob", "bob@example.com"),
    ];
  }
}
