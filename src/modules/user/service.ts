import { v4 as uuidv4 } from "uuid";
import redisClient from "../../utils/redis";

/**
 * @desc: Defines the business logic for user-related tasks.
 */
class UserService {
  /**
   * @desc: Creates a new session by generating a token and storing it in Redis.
   * @param email - The user's email.
   * @returns The newly created session token.
   */
  public static async createSession(email: string): Promise<string> {
    const token = uuidv4();
    // In a real application, you would set an expiration time for the token.
    await redisClient.set(token, email);
    return token;
  }
}

export default UserService;
