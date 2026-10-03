using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class MembersController(IMemberRepository memberRepository) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SeedUserDTO>>> GetMembers()
    {
        var members = await memberRepository.GetMembersAsync();

        var memberDtos = members.Select(user => new SeedUserDTO
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email,
            PhotoUrl = user.PhotoUrl,
            Age = user.Age,
            City = user.City,
            Bio = user.Bio
        }).ToList();

        return Ok(memberDtos);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<SeedUserDTO>> GetMember(string id)
    {
        var user = await memberRepository.GetMemberByIdAsync(id);

        if (user == null) return NotFound();

        var memberDto = new SeedUserDTO
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email,
            PhotoUrl = user.PhotoUrl,
            Age = user.Age,
            City = user.City,
            Bio = user.Bio
        };

        return Ok(memberDto);
    }
}