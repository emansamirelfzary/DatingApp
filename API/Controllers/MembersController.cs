using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace API.Controllers;

[Authorize]
public class MembersController(
    IMemberRepository memberRepository,
    IPhotoService photoService,
    ILogger<MembersController> logger) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PaginatedResult<MemberDTO>>> GetMembers([FromQuery] MemberParams memberParams)
    {
        var currentMemberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentMemberId == null) return Unauthorized();

        memberParams.CurrentMemberId = currentMemberId;
        var members = await memberRepository.GetMembersAsync(memberParams, currentMemberId);

        var memberDtos = members.Items.Select<Member, MemberDTO>(member => new MemberDTO(
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

        return Ok(new PaginatedResult<MemberDTO>
        {
            Items = memberDtos,
            Metadata = members.Metadata
        });
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
        var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (memberId == null) return BadRequest("User ID not found in token.");
        if (memberId != id) return Forbid();

        var member = await memberRepository.GetMemberForUpdateAsync(memberId);
        if (member == null) return NotFound();
        member.DisplayName = updateMemberDTO.DisplayName;
        member.City = updateMemberDTO.City;
        member.Description = updateMemberDTO.Bio;
        member.Country = updateMemberDTO.Country;
        member.DateOfBirth = updateMemberDTO.DateOfBirth!.Value;
        member.Gender = updateMemberDTO.Gender;

        memberRepository.UpdateMember(member);
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

    [Authorize]
    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDTO>> AddPhoto([FromForm] IFormFile file)
    {
        var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (memberId == null) return BadRequest("User ID not found in token.");

        var member = await memberRepository.GetMemberForUpdateAsync(memberId);
        if (member == null) return NotFound();

        if (file == null || file.Length == 0)
        {
            return BadRequest("Please select a photo to upload.");
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest("Photo files must be 5 MB or smaller.");
        }

        if (string.IsNullOrWhiteSpace(file.ContentType)
            || !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Only image files can be uploaded.");
        }

        if (!photoService.IsConfigured)
        {
            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Photo uploads are unavailable",
                detail: "Configure Cloudinary credentials in API/appsettings.Local.json before uploading photos.");
        }

        CloudinaryDotNet.Actions.ImageUploadResult result;
        try
        {
            result = await photoService.UploadPhotoAsync(file);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Photo storage failed for member {MemberId}.", memberId);
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Photo upload failed",
                detail: "The photo storage service could not process this upload. Please try again.");
        }

        if (result.Error != null)
        {
            logger.LogWarning("Photo storage rejected an upload for member {MemberId}: {Error}", memberId, result.Error.Message);
            return BadRequest(result.Error.Message);
        }

        if (result.SecureUrl == null || string.IsNullOrWhiteSpace(result.PublicId))
        {
            logger.LogError("Photo storage returned an incomplete result for member {MemberId}.", memberId);
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "Photo upload failed",
                detail: "The photo storage service returned an invalid response. Please try again.");
        }

        var photo = new Photo
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId,
            IsMain = member.Photos.Count == 0,
            MemberId = member.Id
        };
        if (member.ImageUrl == null)
        {
            member.ImageUrl = photo.Url;
            member.User.PhotoUrl = photo.Url;
        }
        member.Photos.Add(photo);

        if (await memberRepository.SaveAllAsync())
        {
            return CreatedAtAction(nameof(GetMember), new { id = member.Id }, new PhotoDTO(
                photo.Id,
                photo.Url,
                photo.IsMain,
                photo.MemberId,
                photo.PublicId));
        }

        return BadRequest("Problem adding photo");
    }
    [HttpPut("set-main-photo/{photoId:int}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (memberId == null) return BadRequest("User ID not found in token.");

        var member = await memberRepository.GetMemberForUpdateAsync(memberId);
        if (member == null) return NotFound();

        var photo = member.Photos.SingleOrDefault(p => p.Id == photoId);
        if (photo == null) return NotFound("Photo not found");

        if (photo.IsMain) return BadRequest("This is already your main photo");

        member.SetMainPhoto(photoId);

        if (await memberRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Failed to set main photo");
    }

[HttpDelete("delete-photo/{photoId:int}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (memberId == null) return BadRequest("User ID not found in token.");

        var member = await memberRepository.GetMemberForUpdateAsync(memberId);
        if (member == null) return NotFound();

        var photo = member.Photos.SingleOrDefault(p => p.Id == photoId);
        if (photo == null) return NotFound("Photo not found");

        if (photo.IsMain) return BadRequest("You cannot delete your main photo");

        if (photo.PublicId != null)
        {
            var result = await photoService.DeletePhotoAsync(photo.PublicId);
            if (result.Error != null)
            {
                return BadRequest(result.Error.Message);
            }
        }

        member.Photos.Remove(photo);

        if (await memberRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Failed to delete the photo");
    }
}
