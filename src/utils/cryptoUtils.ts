import crypto from 'crypto';

/**
 * Create cipherText used to store sensitive data using a cryptographically secure algorithm
 * @param secretAlgorithm symmetrical algorithm used
 * @param secretKey encryption key
 * @param plainText the text to encrypt
 * @returns the cryptographically secure ciphertext
 */
export const encipherText = ({
    secretAlgorithm,
    secretKey,
    plainText,
}: {
    secretAlgorithm: string;
    secretKey: string;
    plainText: string;
}) => {
    const cipher = crypto.createCipher(secretAlgorithm, secretKey);
    const cipherText = cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex');

    return cipherText;
};

/**
 * Create plaintext from encrypted text
 * @param secretAlgorithm symmetrical algorithm used
 * @param secretKey encryption key
 * @param plainText the text to decrypt
 * @returns the original plaintext
 */
export const decipherText = ({
    secretAlgorithm,
    secretKey,
    cipherText,
}: {
    secretAlgorithm: string;
    secretKey: string;
    cipherText: string;
}) => {
    try {
        const decipher = crypto.createDecipher(secretAlgorithm, secretKey);
        const plainText = decipher.update(cipherText, 'hex', 'utf8') + decipher.final('utf8');

        return plainText;
    } catch {
        return ''; // Don't give any ERROR information that might expose the SECRET_ALGORITHM used
    }
};
