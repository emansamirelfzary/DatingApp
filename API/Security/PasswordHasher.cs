using System.Security.Cryptography;
using System.Text;

namespace API.Security;

public static class PasswordHasher
{
    private const int SaltSize = 16;
    private const int HashSize = 64;
    private const int Iterations = 210_000;

    public static (byte[] Hash, byte[] Salt) Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        return (Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA512, HashSize), salt);
    }

    public static bool Verify(string password, byte[] hash, byte[] salt)
    {
        var candidate = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA512, HashSize);
        return CryptographicOperations.FixedTimeEquals(candidate, hash);
    }

    public static bool VerifyLegacyHmac(string password, byte[] hash, byte[] salt)
    {
        using var hmac = new HMACSHA512(salt);
        var candidate = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return CryptographicOperations.FixedTimeEquals(candidate, hash);
    }
}
