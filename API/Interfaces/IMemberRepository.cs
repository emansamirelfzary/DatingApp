using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMemberRepository
{
    void AddMember(Member member);
    void UpdateMember(Member member); // Add this method signature
    Task<bool> SaveAllAsync();
    Task<PaginatedResult<Member>> GetMembersAsync(MemberParams memberParams, string excludedMemberId);
    Task<Member?> GetMemberByIdAsync(string id);
    Task<Member?> GetMemberForUpdateAsync(string id);
    Task<IReadOnlyList<Photo>> GetPhotosByMemberIdAsync(string memberId);
    
}