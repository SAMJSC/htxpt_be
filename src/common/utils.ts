import { compare, hashSync } from "bcrypt";

export function generateHash(password: string): string {
    return hashSync(password, 10);
}

export function validateHash(
    password: string | undefined,
    hash: string | undefined
): Promise<boolean> {
    if (!password || !hash) {
        return Promise.resolve(false);
    }

    return compare(password, hash);
}
