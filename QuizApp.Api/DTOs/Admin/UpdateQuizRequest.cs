using System.Text.Json.Serialization;

namespace QuizApp.Api.DTOs.Admin;

// PUT accepts the same editable fields as POST; IDs come from the route.
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public class UpdateQuizRequest : CreateQuizRequest { }
