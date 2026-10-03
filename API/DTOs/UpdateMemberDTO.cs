using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public sealed class UpdateMemberDTO
{
    [Required, StringLength(50)]
    public string DisplayName { get; init; } = string.Empty;

    [Required]
    public DateOnly? DateOfBirth { get; init; }

    [Required, StringLength(30)]
    public string Gender { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string City { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string Country { get; init; } = string.Empty;

    [StringLength(500)]
  public string? Description { get; set; }
}
