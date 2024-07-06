import { createHash } from 'crypto';

import * as bcrypt from 'bcryptjs';

export default class HashHelper {
  private static salt = 12;

  /**
   * Encrypts plain string
   *
   * @param str {string}
   *
   * @returns Promise<string> Returns encrypted
   */
  static async encrypt(str: string): Promise<string> {
    return bcrypt.hash(str, this.salt);
  }

  /**
   * Compares encrypted and provided string
   * @param plain {string}
   *
   * @param encrypted {string}
   *
   * @returns Promise<boolean> Returns Boolean if provided string and encrypted string are equal
   */
  static async compare(plain: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(plain, encrypted);
  }

  /**
   * Hash md5
   *
   * @returns string Returns encrypted
   */
  static hashCrypto(str: string, algorithm = 'md5'): string {
    return createHash(algorithm).update(str).digest('hex');
  }
}
