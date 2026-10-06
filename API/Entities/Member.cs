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
public int Age => DateTime.Today.Year - DateOfBirth.Year - (DateTime.Today.DayOfYear < DateOfBirth.DayOfYear ? 1 : 0);

// Navigation property to the Photo entity
public  List<Photo> Photos { get; set; } = [];

// Navigation property to the AppUser entity
[ForeignKey(nameof(Id))]
public AppUser User { get; set; } = null!;

public void SetMainPhoto(int photoId)
{
    var photo = Photos.SingleOrDefault(photo => photo.Id == photoId)
        ?? throw new ArgumentException("Photo does not belong to this member.", nameof(photoId));

    foreach (var memberPhoto in Photos)
    {
        memberPhoto.IsMain = memberPhoto.Id == photoId;
    }

    ImageUrl = photo.Url;
    User.PhotoUrl = photo.Url;
}
}
