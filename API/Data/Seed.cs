using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using API.DTOs;
using API.Entities;

namespace API.Data;

public class Seed
{
    public static async Task SeedUsers(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        var memberData = await File.ReadAllTextAsync("Data/UserSeedData.json");
        var members = JsonSerializer.Deserialize<List<SeedUserDTO>>(memberData);

        if (members == null)
        {
            
         return;}

         using var hmac = new HMACSHA512();

        foreach (var member in members)
        {
           var user = new AppUser
            {
                Id = member.Id,
                DisplayName = member.DisplayName,
                Email = member.Email,
                PasswordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes("Pa$$w0rd")),
                PasswordSalt = hmac.Key,
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

        user.Member.Photos.Add(new Photo
        {
            Url = member.ImageUrl,
            MemberId = member.Id,
        }); // Set the navigation property to the AppUser entity

            context.Users.Add(user);
        }

        await context.SaveChangesAsync();
    }
}