namespace API.DTOs;

/// <summary>Profile details returned by the members API.</summary>
public sealed record MemberDTO(
    string Id,
    string DisplayName,
    string Email,
    DateOnly DateOfBirth,
    string? PhotoUrl,
    int Age,
    string City,
    string? Bio,
    DateTime Created,
    DateTime LastActive,
    string Gender,
    string Country);
