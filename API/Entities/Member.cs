using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class Member
{
public string Id { get; set; } = null!;
public string DisplayName { get; set; } = null!;
public DateOnly DateOfBirth { get; set; }
public string? ImageUrl { get; set; }
public DateTime Created { get; set; } = DateTime.UtcNow;
public DateTime LastActive { get; set; } = DateTime.UtcNow;
public required string Gender { get; set; }
public string? Description { get; set; }
public required string City { get; set; }
public required string Country { get; set; }

// Navigation property to the Photo entity
public  List<Photo> Photos { get; set; } = [];

// Navigation property to the AppUser entity
[ForeignKey(nameof(Id))]
public AppUser User { get; set; } = null!;
}
