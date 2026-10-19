using Microsoft.AspNetCore.Http;

namespace API.Interfaces;

public interface IPhotoService
{
    bool IsConfigured { get; }
    Task<PhotoUploadResult> UploadPhotoAsync(IFormFile file);
    Task<PhotoDeletionResult> DeletePhotoAsync(string publicId);
}

public sealed record PhotoUploadResult(Uri? SecureUrl, string? PublicId, string? ErrorMessage = null);

public sealed record PhotoDeletionResult(bool Succeeded, string? ErrorMessage = null);
