using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using API.DTOs;
using API.Entities;
using API.Security;
using Microsoft.AspNetCore.Identity;

namespace API.Data;

public class Seed
{
    public static async Task SeedUsers(UserManager<AppUser> userManager)
    {
        // Seed the demo members only when the database is empty, to avoid duplicates.
        if (!await userManager.Users.AnyAsync())
        {
            var memberData = await File.ReadAllTextAsync("Data/UserSeedData.json");
            var members = JsonSerializer.Deserialize<List<SeedUserDTO>>(memberData);

            if (members != null)
            {
                foreach (var member in members)
                {
                    var user = new AppUser
                    {
                        Id = member.Id,
                        DisplayName = member.DisplayName,
                        Email = member.Email,
                        UserName = member.Email,
                        PhotoUrl = member.ImageUrl,
                        City = member.City,
                        Bio = member.Description,
                        Age = DateTime.Today.Year - member.DateOfBirth.Year - (DateTime.Today.DayOfYear < member.DateOfBirth.DayOfYear ? 1 : 0),
                        Member = new Member
                        {
                            Id = member.Id,
                            DisplayName = member.DisplayName,
                            DateOfBirth = member.DateOfBirth,
                            ImageUrl = member.ImageUrl,
                            Created = member.Created,
                            LastActive = member.LastActive,
                            Gender = member.Gender,
                            Description = member.Description,
                            City = member.City,
                            Country = member.Country
                        }
                    };

                    if (!string.IsNullOrWhiteSpace(member.ImageUrl))
                    {
                        user.Member.Photos.Add(new Photo
                        {
                            Url = member.ImageUrl,
                            MemberId = member.Id,
                            IsMain = true
                        });
                    }
                    var result = await userManager.CreateAsync(user, "Pa$$w0rd");
                    if (!result.Succeeded)
                    {
                        Console.WriteLine(string.Join("; ", result.Errors.Select(error => error.Description)));
                        continue;
                    }

                    var roleResult = await userManager.AddToRoleAsync(user, "Member");
                    if (!roleResult.Succeeded)
                    {
                        Console.WriteLine(string.Join("; ", roleResult.Errors.Select(error => error.Description)));
                    }
                }
            }
        }

        // Always ensure an admin account exists (idempotent), independent of other users.
        await SeedAdmin(userManager);
    }

    private static async Task SeedAdmin(UserManager<AppUser> userManager)
    {
        const string adminEmail = "admin@test.com";
        const string adminPassword = "Pa$$w0rd";

        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin == null)
        {
            admin = new AppUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                DisplayName = "Admin"
            };
            var result = await userManager.CreateAsync(admin, adminPassword);
            if (!result.Succeeded)
            {
                Console.WriteLine(result.Errors.First().Description);
                return;
            }
        }

        // Ensure the admin has both required roles.
        foreach (var role in new[] { "Admin", "Moderator" })
        {
            if (!await userManager.IsInRoleAsync(admin, role))
            {
                await userManager.AddToRoleAsync(admin, role);
            }
        }
    }
}

