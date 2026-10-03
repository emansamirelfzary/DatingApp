using API.Entities;

namespace API.Interfaces;

public interface IMemberRepository
{
    void AddMember(Member member);
    void UpdateMember(Member member); // Add this method signature
    Task<bool> SaveAllAsync();
    Task<IReadOnlyList<Member>> GetMembersAsync();
    Task<Member?> GetMemberByIdAsync(string id);
    Task<IReadOnlyList<Photo>> GetPhotosByMemberIdAsync(string memberId);
    
}