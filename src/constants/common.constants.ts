export const jwtConstants = {
    secret: "DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.",
};

export enum USER_ROLES {
    SUPER_ADMIN = "super_admin",
    CUSTOMER = "customer",
    GARDENER = "gardener",
    ADMIN = "admin",
}

export enum PRODUCT_CATEGORY {
    TYPE1 = "type1",
    TYPE2 = "type2",
    TYPE3 = "type3",
    TYPE4 = "type4",
    TYPE5 = "type5",
    TYPE6 = "type6",
}

export enum GENDER {
    Male = "Male",
    Female = "Female",
    Other = "Other",
}

export enum AUTHEN_METHODS {
    LOCAL = "local",
    GOOGLE = "google",
}
