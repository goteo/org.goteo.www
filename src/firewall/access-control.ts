export type ControlItem = {
    path: string;
    roles: string[];
};

export const ACL: ControlItem[] = [{ path: "/admin", roles: ["ROLE_ADMIN"] }];
