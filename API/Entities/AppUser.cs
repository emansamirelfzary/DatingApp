namespace API.Entities;

public class AppUser
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    // New profile fields
    public string? PhotoUrl { get; set; }
    public int Age { get; set; }
    public string? City { get; set; }
    public string? Bio { get; set; }
    public required byte [] PasswordHash { get; set; }
    public required byte [] PasswordSalt { get; set; }
}
