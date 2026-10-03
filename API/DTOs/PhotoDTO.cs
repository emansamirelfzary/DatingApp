namespace API.DTOs;

/// <summary>Photo information returned by the members API.</summary>
public sealed record PhotoDTO(
    int Id,
    string Url,
    bool IsMain,
    string MemberId,
    string? PublicId);
