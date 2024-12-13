import bcrypt from 'bcrypt';


export async function HashedPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}


export async function ComparePassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
}
