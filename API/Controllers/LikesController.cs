using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Authorize]
public class LikesController(ILikesRepository likesRepository) : BaseApiController
{
    [HttpPost("{targetMemberId}")]
    public async Task<ActionResult> ToggleLike(string targetMemberId)
    {
        var sourceMemberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(sourceMemberId)) return Unauthorized();

        if (sourceMemberId == targetMemberId)
        {
            return BadRequest("You cannot like yourself.");
        }

        var existingLike = await likesRepository.GetMemberLike(sourceMemberId, targetMemberId);

        if (existingLike is null)
        {
            likesRepository.AddLike(new MemberLike
            {
                SourceMemberId = sourceMemberId,
                TargetMemberId = targetMemberId
            });
        }
        else
        {
            likesRepository.DeleteLike(existingLike);
        }

        await likesRepository.SaveAllChanges();
        return NoContent();
    }

    [HttpGet("list")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        return Ok(await likesRepository.GetCurrentMemberLikeIds(userId));
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MemberDTO>>> GetMemberLikes(string predicate)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var members = await likesRepository.GetMemberLikes(predicate, userId);

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
            member.Country));

        return Ok(memberDtos);
    }
}