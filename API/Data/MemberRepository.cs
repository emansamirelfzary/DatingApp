using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MemberRepository(AppDbContext context) : IMemberRepository
{
    public void AddMember(Member member)
    {
        context.Members.Add(member);
    }

    public async Task<Member?> GetMemberByIdAsync(string id)
    {
        return await context.Members
            .Include(member => member.User)
            .SingleOrDefaultAsync(member => member.Id == id);
    }

    public async Task<IReadOnlyList<Member>> GetMembersAsync()
    {
        return await context.Members
            .Include(member => member.User)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Photo>> GetPhotosByMemberIdAsync(string memberId)
    {
        return await context.Photos
            .Where(photo => photo.MemberId == memberId)
            .ToListAsync();
    }
    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }   

    public void Update(Member member)
    {
        context.Entry(member).State = EntityState.Modified;
    }
}