import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { UserController } from "../controllers/UserController";
export const UserList = () => {
    const users = UserController.getUsers();
    return (_jsxs("div", { children: [_jsx("h2", { children: "Benutzerliste" }), _jsx("ul", { children: users.map((user) => (_jsxs("li", { children: [user.name, " - ", user.email] }, user.id))) })] }));
};
