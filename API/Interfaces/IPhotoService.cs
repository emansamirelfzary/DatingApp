use CloudinaryDotNet.Actions;

namespace API.Interfaces;

public interface IPhotoService
{
    Task<string> UploadPhotoAsync(IFormFile file);
    Task<bool> DeletePhotoAsync(string publicId);
}