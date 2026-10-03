using API.DTOs;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

public class MembersController(IMemberRepository memberRepository) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MemberDTO>>> GetMembers()
    {
        var members = await memberRepository.GetMembersAsync();

        var memberDtos = members.Select(member => new MemberDTO(
            member.Id,
            member.DisplayName,
            member.User.Email,
            member.DateOfBirth,
            member.ImageUrl,
            member.Age,
            member.City,
            member.Description,
            member.Created,
            member.LastActive,
            member.Gender,
            member.Country)).ToList();

        return Ok(memberDtos);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<MemberDTO>> GetMember(string id)
    {
        var member = await memberRepository.GetMemberByIdAsync(id);

        if (member == null) return NotFound();

        return Ok(new MemberDTO(
            member.Id,
            member.DisplayName,
            member.User.Email,
            member.DateOfBirth,
            member.ImageUrl,
            member.Age,
            member.City,
            member.Description,
            member.Created,
            member.LastActive,
            member.Gender,
            member.Country));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<MemberDTO>> UpdateMember(string id, UpdateMemberDTO updateMemberDTO)
    {
        if (User.FindFirstValue(ClaimTypes.NameIdentifier) != id)
        {
            return Forbid();
        }

        var member = await memberRepository.GetMemberByIdAsync(id);
        if (member is null)
        {
            return NotFound();
        }

        if (updateMemberDTO.DateOfBirth is not DateOnly dateOfBirth)
        {
            return BadRequest("Date of birth is required.");
        }

        if (dateOfBirth > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return BadRequest("Date of birth cannot be in the future.");
        }

        member.DisplayName = updateMemberDTO.DisplayName.Trim();
        member.User.DisplayName = member.DisplayName;
        member.DateOfBirth = dateOfBirth;
        member.Gender = updateMemberDTO.Gender.Trim();
        member.City = updateMemberDTO.City.Trim();
        member.Country = updateMemberDTO.Country.Trim();
        member.Description = updateMemberDTO.Bio?.Trim();

        await memberRepository.SaveAllAsync();

        return Ok(new MemberDTO(
            member.Id,
            member.DisplayName,
            member.User.Email,
            member.DateOfBirth,
            member.ImageUrl,
            member.Age,
            member.City,
            member.Description,
            member.Created,
            member.LastActive,
            member.Gender,
            member.Country));
    }

    [Authorize]
    [HttpGet("{id}/photos")]
    public async Task<ActionResult<IReadOnlyList<PhotoDTO>>> GetMemberPhotos(string id)
    {
        var member = await memberRepository.GetMemberByIdAsync(id);
        if (member is null)
        {
            return NotFound();
        }

        var photos = await memberRepository.GetPhotosByMemberIdAsync(id);
        return Ok(photos.Select(photo => new PhotoDTO(
            photo.Id,
            photo.Url,
            photo.IsMain,
            photo.MemberId,
            photo.PublicId)).ToList());
    }
}