export const jwtConstants = {
    secret: "DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.",
};

export enum UserRoles {
    USER = "user",
    GARDENER = "gardener",
    ADMIN = "admin",
}

export enum Gender {
    MALE = 1,
    FEMALE,
    NONE,
}
