using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using API.DTOs;
using API.Entities;
using API.Security;

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

        foreach (var member in members)
        {
           var (passwordHash, passwordSalt) = PasswordHasher.Hash("Pa$$w0rd");
           var user = new AppUser
            {
                Id = member.Id,
                DisplayName = member.DisplayName,
                Email = member.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
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

            context.Users.Add(user);
        }

        await context.SaveChangesAsync();
    }
}
