namespace API.Entities;

public class Photo
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public bool IsMain { get; set; }
    public string? PublicId { get; set; }
    
    // Navigation property to the Member entity
    public Member Member { get; set; } = null!;
    public string MemberId { get; set; } = null!;
}