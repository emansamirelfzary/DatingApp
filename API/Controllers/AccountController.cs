using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Extentions;
using API.Security;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController(AppDbContext Context, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDTO)
    {
        var email = registerDTO.Email.Trim().ToLowerInvariant();
        if (await UserExists(email))
        {
            return BadRequest("Email is already taken.");
        }

        var (passwordHash, passwordSalt) = PasswordHasher.Hash(registerDTO.Password);
        var user = new AppUser
        {
            Email = email,
            DisplayName = registerDTO.DisplayName.Trim(),
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            Member = new Member
            {
                DisplayName = registerDTO.DisplayName.Trim(),
                DateOfBirth = registerDTO.DateOfBirth!.Value,
                Gender = registerDTO.Gender.Trim(),
                City = registerDTO.City.Trim(),
                Country = registerDTO.Country.Trim()
            }
        };

        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        return user.ToDTO(tokenService);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDto)
    {
        var user = await Context.Users.SingleOrDefaultAsync(x => x.Email == loginDto.Email.Trim().ToLower());

        if (user == null) return Unauthorized("Invalid email address");

        var validPassword = user.PasswordSalt.Length == 16
            ? PasswordHasher.Verify(loginDto.Password, user.PasswordHash, user.PasswordSalt)
            : PasswordHasher.VerifyLegacyHmac(loginDto.Password, user.PasswordHash, user.PasswordSalt);
        if (!validPassword) return Unauthorized("Invalid email or password");

        if (user.PasswordSalt.Length != 16)
        {
            (user.PasswordHash, user.PasswordSalt) = PasswordHasher.Hash(loginDto.Password);
            await Context.SaveChangesAsync();
        }

        return user.ToDTO(tokenService);
    }

    private async Task<bool> UserExists(string email)
    {
        return await Context.Users.AnyAsync(u => u.Email == email);
    }
}
