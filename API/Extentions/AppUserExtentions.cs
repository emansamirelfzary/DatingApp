using System;
using API.Entities;
using API.Interfaces;
using API.DTOs;

namespace API.Extentions;

public static class AppUserExtentions
{
public static async Task<UserDTO> ToDTO(this AppUser user, ITokenService tokenService)
{
    return new UserDTO
    {
        Id = user.Id,
        Email = user.Email!,
        DisplayName = user.DisplayName,
        ImageUrl = user.PhotoUrl,
        Token = await tokenService.CreateToken(user)
    };
}
}
