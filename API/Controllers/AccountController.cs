using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Extentions;
using API.Security;
using Microsoft.AspNetCore.Identity;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDTO)
    {
        var email = registerDTO.Email.Trim().ToLowerInvariant();
      

        var (passwordHash, passwordSalt) = PasswordHasher.Hash(registerDTO.Password);
        var user = new AppUser
        {
            Email = email,
            DisplayName = registerDTO.DisplayName.Trim(),
            UserName=registerDTO.Email,

            Member = new Member
            {
                DisplayName = registerDTO.DisplayName.Trim(),
                DateOfBirth = registerDTO.DateOfBirth!.Value,
                Gender = registerDTO.Gender.Trim(),
                City = registerDTO.City.Trim(),
                Country = registerDTO.Country.Trim()
            }
        };
var result = await userManager.CreateAsync(user, registerDTO.Password);

if (!result.Succeeded)
{
    foreach (var error in result.Errors)
    {
        ModelState.AddModelError("identity", error.Description);
    }
    return ValidationProblem();
}

        return user.ToDTO(tokenService);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDto)
    {
       var user = await userManager.FindByEmailAsync(loginDto.Email);

    if (user == null) return Unauthorized("Invalid email address");

    var result = await userManager.CheckPasswordAsync(user, loginDto.Password);

    if (!result) return Unauthorized("Invalid password");

     
        return user.ToDTO(tokenService);
    }

}
