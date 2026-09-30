using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using QuizApp.Api.Configuration;
using QuizApp.Api.DTOs.Auth;
using QuizApp.Api.Models;

namespace QuizApp.Api.Services;

public class JwtTokenService(IOptions<JwtSettings> options)
{
    public AuthResponse Create(User user)
    {
        if (user.Role is not (UserRoles.Admin or UserRoles.Student))
            throw new InvalidOperationException("User role is not supported.");
        var settings = options.Value;
        var now = DateTime.UtcNow;
        var token = new JwtSecurityToken(
            issuer: settings.Issuer, audience: settings.Audience,
            claims: new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString(CultureInfo.InvariantCulture)),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim("role", user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                    new DateTimeOffset(now).ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture),
                    ClaimValueTypes.Integer64)
            },
            notBefore: now, expires: now.AddMinutes(settings.ExpirationMinutes),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SigningKey)),
                SecurityAlgorithms.HmacSha256));
        return new AuthResponse(new JwtSecurityTokenHandler().WriteToken(token),
            user.UserId, user.Username, user.Email, user.Role);
    }
}
