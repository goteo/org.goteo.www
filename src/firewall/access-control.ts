export type ControlItem = {
    path: string;
    roles: string[];
};

export const ACL: ControlItem[] = [
    {
        path: "/admin",
        roles: ["ROLE_ADMIN"]
    },
    {
        path: "/project/.*/edit",
        roles: ["ROLE_USER"]
    }];
