using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class AppUser: IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
    
    // New profile fields
    public string? PhotoUrl { get; set; }
    public int Age { get; set; }
    public string? City { get; set; }
    public string? Bio { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    // Navigation property to the Member entity
    public Member Member { get; set; } = null!;
}
