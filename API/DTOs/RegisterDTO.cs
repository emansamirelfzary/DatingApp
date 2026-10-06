using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDTO
{
    [Required, EmailAddress, StringLength(256)]
    public string Email { get; set; } = "";
    [Required, StringLength(50)]
    public string DisplayName { get; set; } = "";
    [Required, MinLength(12, ErrorMessage = "Password must be at least 12 characters long.")]
    public string Password { get; set; } = "";
    [Required]
    public DateOnly? DateOfBirth { get; set; }
    [Required, StringLength(30)]
    public string Gender { get; set; } = "";
    [Required, StringLength(100)]
    public string City { get; set; } = "";
    [Required, StringLength(100)]
    public string Country { get; set; } = "";
}
