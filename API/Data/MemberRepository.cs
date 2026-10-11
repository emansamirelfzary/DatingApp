using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MemberRepository(AppDbContext context) : IMemberRepository
{
    public void AddMember(Member member)
    {
        context.Members.Add(member);
    }

    // Read-Only: Fast query with AsNoTracking
    public async Task<Member?> GetMemberByIdAsync(string id)
    {
        return await context.Members
            .AsNoTracking()
            .Include(member => member.User)
            .Include(member => member.Photos)
            .FirstOrDefaultAsync(member => member.Id == id);
    }

    // For Updates: Tracked by EF Core Change Tracker
    public async Task<Member?> GetMemberForUpdateAsync(string id)
    {
        return await context.Members
            .Include(member => member.User)
            .Include(member => member.Photos)
            .FirstOrDefaultAsync(member => member.Id == id);
    }

    public async Task<PaginatedResult<Member>> GetMembersAsync(MemberParams memberParams, string excludedMemberId)
    {
        var minAge = Math.Min(memberParams.MinAge, memberParams.MaxAge);
        var maxAge = Math.Max(memberParams.MinAge, memberParams.MaxAge);
        var today = DateTime.UtcNow.Date;
        var minDob = DateOnly.FromDateTime(today.AddYears(-maxAge - 1));
        var maxDob = DateOnly.FromDateTime(today.AddYears(-minAge));

        var query = context.Members
            .AsNoTracking()
            .Include(member => member.User)
            .Where(member => member.Id != excludedMemberId)
            .Where(member => member.DateOfBirth >= minDob && member.DateOfBirth <= maxDob);

        if (!string.IsNullOrWhiteSpace(memberParams.Gender))
        {
            var gender = memberParams.Gender.Trim().ToLower();
            query = query.Where(member => member.Gender.ToLower() == gender);
        }

        query = memberParams.OrderBy.ToLowerInvariant() switch
        {
            "created" => query.OrderByDescending(member => member.Created),
            "createdasc" => query.OrderBy(member => member.Created),
            "lastactiveasc" => query.OrderBy(member => member.LastActive),
            "displayname" => query.OrderBy(member => member.DisplayName.ToLower()),
            "displaynamedesc" => query.OrderByDescending(member => member.DisplayName.ToLower()),
            _ => query.OrderByDescending(member => member.LastActive)
        };

        return await PaginatedResult<Member>.CreateAsync(
            query,
            memberParams.PageNumber,
            memberParams.PageSize);
    }

    public async Task<IReadOnlyList<Photo>> GetPhotosByMemberIdAsync(string memberId)
    {
        return await context.Photos
            .AsNoTracking()
            .Where(photo => photo.MemberId == memberId)
            .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void UpdateMember(Member member)
    {
        context.Entry(member).State = EntityState.Modified;
    }
}