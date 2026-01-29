import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (stored: string, supplied: string): Promise<boolean> => {
  return bcrypt.compare(stored, supplied); // Note: bcrypt.compare(data, encrypted)
};
