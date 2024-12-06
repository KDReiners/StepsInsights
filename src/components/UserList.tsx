import React from "react";
import { UserController } from "../controllers/UserController";

export const UserList: React.FC = () => {
  const users = UserController.getUsers();

  return (
    <div>
      <h2>Benutzerliste</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};
