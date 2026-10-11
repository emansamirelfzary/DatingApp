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

    public async Task<PaginatedResult<Member>> GetMembersAsync(MemberParams MemberParams, string excludedMemberId)
    {
        var query = context.Members
            .AsNoTracking()
            .Include(member => member.User)
            .Where(member => member.Id != excludedMemberId);

if(MemberParams.Gender != null)
        {
            query= query.Where(x=>x.Gender==MemberParams.Gender);
        }
        return await PaginatedResult<Member>.CreateAsync(
            query,
            MemberParams.PageNumber,
            MemberParams.PageSize);
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