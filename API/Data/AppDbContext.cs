using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<AppUser> Users { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<MemberLike> Likes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<MemberLike>(entity =>
        {
            entity.HasKey(like => new { like.SourceMemberId, like.TargetMemberId });

            entity.HasOne(like => like.SourceMember)
                .WithMany(member => member.LikedMembers)
                .HasForeignKey(like => like.SourceMemberId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(like => like.TargetMember)
                .WithMany(member => member.LikedByMembers)
                .HasForeignKey(like => like.TargetMemberId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}